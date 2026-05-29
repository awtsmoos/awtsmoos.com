// B"H
const OP = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '%': 'mod', '==': 'eq', '===': 'seq', '!=': 'neq', '!==': 'sneq', '<': 'lt', '<=': 'lte', '>': 'gt', '>=': 'gte' };
const LOGICAL = { '&&': 'and', '||': 'or' };
const UNARY = { '!': 'not', '-': 'neg', '+': 'pos', typeof: 'typeof', void: 'void' };

/**
 * Lowers a growing AST subset into raw Merkava JSON code.
 * Advanced constructs become semantic descriptors, not source strings.
 */
function lowerAstToJson(ast) {
  const steps = [];

  const blockSteps = body => {
    const out = [];
    for (const stmt of body?.body || []) {
      const lowered = lowerStmt(stmt, out);
      if (lowered?.result) out.push({ op: 'return', value: lowered.result });
    }
    return out;
  };

  const statementSteps = stmt => {
    const out = [];
    const lowered = lowerStmt(stmt, out);
    if (lowered?.result) out.push({ op: 'return', value: lowered.result });
    return out;
  };

  const returnExpr = body => {
    const stmt = (body?.body || []).find(s => s.type === 'ReturnStatement');
    return stmt ? expr(stmt.argument) : { const: undefined };
  };

  const yieldsOf = body => (body?.body || [])
    .filter(s => s.type === 'ExpressionStatement' && s.expression?.type === 'YieldExpression')
    .map(s => literalValue(s.expression.argument));

  const literalValue = node => node?.type === 'Literal' ? node.value : expr(node);

  const methodDescriptor = method => ({
    name: method.key.name,
    params: (method.value.params || []).map(paramName),
    body: { op: 'block', body: blockSteps(method.value.body) }
  });

  const fieldDescriptor = field => ({
    name: propName(field.key),
    value: field.value ? expr(field.value) : { const: undefined }
  });

  const classDescriptor = node => ({
    name: node.id.name,
    superClass: node.superClass ? { get: node.superClass.name } : null,
    methods: (node.body?.body || []).filter(member => member.type === 'MethodDefinition').map(methodDescriptor),
    fields: (node.body?.body || []).filter(member => member.type === 'PropertyDefinition' || member.type === 'FieldDefinition').map(fieldDescriptor)
  });

  const propName = node => node?.type === 'Identifier' ? node.name : node?.type === 'Literal' ? node.value : expr(node);

  const paramName = p => p?.type === 'RestElement' ? { rest: p.argument.name } : p?.type === 'AssignmentPattern' ? { name: p.left.name, default: expr(p.right) } : p?.name;
  const fnBody = node => node.body?.type === 'BlockStatement' ? blockSteps(node.body) : [{ op: 'return', value: expr(node.body) }];
  const fnDescriptor = node => ({
    op: 'function',
    name: node.id?.name || '',
    params: (node.params || []).map(paramName),
    body: fnBody(node)
  });

  const templateLiteral = node => {
    const parts = [];
    for (let i = 0; i < (node.quasis || []).length; i++) {
      const cooked = node.quasis[i]?.value?.cooked ?? node.quasis[i]?.value?.raw ?? '';
      if (cooked) parts.push({ const: cooked });
      if (node.expressions?.[i]) parts.push(expr(node.expressions[i]));
    }
    if (!parts.length) return { const: '' };
    return parts.reduce((left, right) => ({ op: 'add', args: [left, right] }));
  };

  const expr = node => {
    if (!node) return { const: null };
    if (node.type === 'Literal' && node.regex) return { const: new RegExp(node.regex.pattern, node.regex.flags || '') };
    if (node.type === 'Literal') return { const: node.value };
    if (node.type === 'TemplateLiteral') return templateLiteral(node);
    if (node.type === 'TaggedTemplateExpression') return templateLiteral(node.quasi);
    if (node.type === 'MetaProperty') {
      const meta = node.meta?.name || node.meta?.value || "meta";
      const property = node.property?.name || node.property?.value || "";
      if (meta === "import" && property === "meta") return { const: { url: "merkava://module" } };
      return { const: `${meta}.${property}` };
    }
    if (node.type === 'Identifier') return { get: node.name };
    if (node.type === 'ChainExpression') return expr(node.expression);
    if (node.type === 'ThisExpression') return { get: 'this' };
    if (node.type === 'Super') return { get: 'super' };
    if (node.type === 'AwaitExpression') return { op: 'await', value: expr(node.argument) };
    if (node.type === 'YieldExpression') return expr(node.argument);
    if (node.type === 'SpreadElement') return expr(node.argument);
    if (node.type === 'UnaryExpression') return { op: UNARY[node.operator], value: expr(node.argument) };
    if (node.type === 'LogicalExpression') return { op: LOGICAL[node.operator], args: [expr(node.left), expr(node.right)] };
    if (node.type === 'ConditionalExpression') return { op: 'conditional', test: expr(node.test), consequent: expr(node.consequent), alternate: expr(node.alternate) };
    if (node.type === 'BinaryExpression') return { op: LOGICAL[node.operator] || OP[node.operator], args: [expr(node.left), expr(node.right)] };
    if (node.type === 'ArrayExpression') return { op: 'array', items: (node.elements || []).map(expr) };
    if (node.type === 'ObjectExpression') {
      if ((node.properties || []).some(p => p.type === 'SpreadElement')) return {
        op: 'objectMerge',
        parts: (node.properties || []).map(p => p.type === 'SpreadElement'
          ? { spread: expr(p.argument) }
          : { key: propName(p.key), value: expr(p.value) })
      };
      return { op: 'object', props: (node.properties || []).map(p => ({ key: propName(p.key), value: expr(p.value) })) };
    }
    if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') return fnDescriptor(node);
    if (node.type === 'AssignmentExpression') {
      const compound = node.operator && node.operator !== '=' ? OP[node.operator.slice(0, -1)] : null;
      if (node.left.type === 'Identifier') {
        const value = compound ? { op: compound, args: [{ get: node.left.name }, expr(node.right)] } : expr(node.right);
        return { op: 'set', name: node.left.name, value };
      }
      if (node.left.type === 'MemberExpression') {
        const object = expr(node.left.object), prop = node.left.computed ? expr(node.left.property) : { const: propName(node.left.property) };
        const value = compound ? { op: compound, args: [{ op: 'getProp', object, prop }, expr(node.right)] } : expr(node.right);
        return { op: 'setProp', object, prop, value };
      }
    }
    if (node.type === 'UpdateExpression') {
      const delta = { const: node.operator === '++' ? 1 : -1 };
      if (node.argument.type === 'Identifier') return { op: 'set', name: node.argument.name, value: { op: 'add', args: [{ get: node.argument.name }, delta] } };
      if (node.argument.type === 'MemberExpression') {
        const object = expr(node.argument.object), prop = node.argument.computed ? expr(node.argument.property) : { const: propName(node.argument.property) };
        return { op: 'setProp', object, prop, value: { op: 'add', args: [{ op: 'getProp', object, prop }, delta] } };
      }
    }
    if (node.type === 'NewExpression') {
      const calleeName = node.callee?.name;
      if (calleeName === 'Error') return { op: 'newError', message: expr(node.arguments?.[0] || { type: 'Literal', value: '' }) };
      if (calleeName && /^(Uint8Array|Uint16Array|Uint32Array|Int8Array|Int16Array|Int32Array|Float32Array|Float64Array)$/.test(calleeName)) {
        const first = node.arguments?.[0];
        return { op: 'typedArray', kind: calleeName, items: first?.type === 'ArrayExpression' ? first.elements.map(expr) : [] };
      }
      return { op: 'new', class: expr(node.callee), args: (node.arguments || []).map(expr) };
    }
    if (node.type === 'MemberExpression') return { op: node.optional ? 'optionalGetProp' : 'getProp', object: expr(node.object), prop: node.computed ? expr(node.property) : propName(node.property) };
    if (node.type === 'CallExpression') {
      const args = (node.arguments || []).map(expr);
      if (node.callee.type === 'Super') return { op: 'superConstructor', args };
      if (node.callee.type === 'Identifier') return { op: 'callFunction', fn: expr(node.callee), args };
      if (node.callee.type === 'MemberExpression') return { op: 'callMethod', object: expr(node.callee.object), method: propName(node.callee.property), args };
      return { op: 'callFunction', fn: expr(node.callee), args };
    }
    throw new Error(`Unsupported JS AST expression: ${node.type}`);
  };

  const lowerStmt = (stmt, target = steps) => {
    if (stmt.type === 'EmptyStatement') return null;
    if (stmt.type === 'BlockStatement') { target.push({ op: 'block', body: blockSteps(stmt) }); return null; }
    if (stmt.type === 'VariableDeclaration') {
      for (const d of stmt.declarations) {
        if (d.id.type === 'ArrayPattern') {
          const tmp = `__destruct${target.length}`;
          target.push({ op: 'set', name: tmp, value: expr(d.init) });
          (d.id.elements || []).forEach((el, index) => {
            if (!el) return;
            if (el.type === 'Identifier') target.push({ op: 'set', name: el.name, value: { op: 'getProp', object: { get: tmp }, prop: { const: index } } });
            else if (el.type === 'RestElement') target.push({ op: 'set', name: el.argument.name, value: { op: 'callMethod', object: { get: tmp }, method: 'slice', args: [{ const: index }] } });
          });
        } else target.push({ op: 'set', name: d.id.name, value: expr(d.init) });
      }
    } else if (stmt.type === 'ExpressionStatement') {
      target.push(expr(stmt.expression));
    } else if (stmt.type === 'ReturnStatement') {
      return { result: expr(stmt.argument) };
    } else if (stmt.type === 'IfStatement') {
      target.push({
        op: 'if',
        test: expr(stmt.test),
        consequent: stmt.consequent?.type === 'BlockStatement' ? blockSteps(stmt.consequent) : statementSteps(stmt.consequent),
        alternate: stmt.alternate ? (stmt.alternate.type === 'BlockStatement' ? blockSteps(stmt.alternate) : statementSteps(stmt.alternate)) : []
      });
    } else if (stmt.type === 'ForOfStatement') {
      const left = stmt.left?.type === 'VariableDeclaration'
        ? stmt.left.declarations?.[0]?.id?.name
        : stmt.left?.name;
      target.push({
        op: 'forOf',
        left: left || `__forOf${target.length}`,
        right: expr(stmt.right),
        body: stmt.body?.type === 'BlockStatement' ? blockSteps(stmt.body) : statementSteps(stmt.body)
      });
    } else if (stmt.type === 'ForInStatement') {
      const left = stmt.left?.type === 'VariableDeclaration'
        ? stmt.left.declarations?.[0]?.id?.name
        : stmt.left?.name;
      target.push({
        op: 'forOf',
        left: left || `__forIn${target.length}`,
        right: { op: 'callMethod', object: { get: 'Object' }, method: 'keys', args: [expr(stmt.right)] },
        body: stmt.body?.type === 'BlockStatement' ? blockSteps(stmt.body) : statementSteps(stmt.body)
      });
    } else if (stmt.type === 'WhileStatement') {
      target.push({
        op: 'while',
        test: expr(stmt.test),
        body: stmt.body?.type === 'BlockStatement' ? blockSteps(stmt.body) : statementSteps(stmt.body)
      });
    } else if (stmt.type === 'ForStatement') {
      if (stmt.init) {
        if (stmt.init.type === 'VariableDeclaration') lowerStmt(stmt.init, target);
        else target.push(expr(stmt.init));
      }
      const body = stmt.body?.type === 'BlockStatement' ? blockSteps(stmt.body) : statementSteps(stmt.body);
      if (stmt.update) body.push(expr(stmt.update));
      target.push({ op: 'while', test: stmt.test ? expr(stmt.test) : { const: true }, body });
    } else if (stmt.type === 'SwitchStatement') {
      target.push({
        op: 'switch',
        discriminant: expr(stmt.discriminant),
        cases: (stmt.cases || []).map(item => ({
          test: item.test ? expr(item.test) : null,
          body: blockSteps({ body: item.consequent || [] })
        }))
      });
    } else if (stmt.type === 'ThrowStatement') {
      target.push({ op: 'throw', value: expr(stmt.argument) });
    } else if (stmt.type === 'TryStatement') {
      const thrown = (stmt.block?.body || []).find(s => s.type === 'ThrowStatement');
      if (thrown && stmt.handler?.param?.name) {
        target.push({ op: 'set', name: stmt.handler.param.name, value: expr(thrown.argument) });
        target.push(...blockSteps(stmt.handler.body));
      } else {
        target.push(...blockSteps(stmt.block));
      }
      target.push(...blockSteps(stmt.finalizer));
    } else if (stmt.type === 'ClassDeclaration') {
      target.push({ op: 'set', name: stmt.id.name, value: { op: 'class', descriptor: classDescriptor(stmt) } });
    } else if (stmt.type === 'FunctionDeclaration') {
      if (stmt.generator) target.push({ op: 'set', name: stmt.id.name, value: { op: 'generator', values: yieldsOf(stmt.body) } });
      else if (stmt.async) target.push({ op: 'set', name: stmt.id.name, value: fnDescriptor(stmt) });
      else target.push({ op: 'set', name: stmt.id.name, value: fnDescriptor(stmt) });
    } else if (stmt.type === 'ContinueStatement' || stmt.type === 'BreakStatement') {
      return null;
    } else {
      throw new Error(`Unsupported JS AST statement: ${stmt.type}`);
    }
    return null;
  };

  for (const stmt of ast.body || []) {
    const returned = lowerStmt(stmt);
    if (returned) return { steps, ...returned };
  }
  return { steps };
}

module.exports = { lowerAstToJson };
