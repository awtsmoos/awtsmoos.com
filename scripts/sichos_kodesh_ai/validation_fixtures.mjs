// B"H
/** Footnote-aware malformed XML fixtures. */
import { parseSichosXml, validateParsed } from './parse_xml.mjs';

function fixtureSample() {
  return { title: 'fixture', documentId: 'fixture', sections: [{ sectionIndex: 1, paragraphs: [
    { paragraphIndex: 0, text: 'מקור 23', footnotes: ['23'] },
    { paragraphIndex: 1, text: 'עוד תוכן', footnotes: [] }
  ] }] };
}

function assertInvalid(name, xml) {
  let ok = false;
  try { ok = validateParsed(fixtureSample(), parseSichosXml(xml)).ok; } catch { ok = false; }
  if (ok) throw new Error(`Malformed XML fixture unexpectedly passed: ${name}`);
  return name;
}

export function runValidationFixtures() {
  const good = '<translation><v index="1"><s index="0"><en>Source<sup>23</sup></en></s><s index="1"><en>More</en></s></v></translation>';
  return {
    goodValidation: validateParsed(fixtureSample(), parseSichosXml(good), { throwOnError: true }),
    rejected: [
      assertInvalid('missing sup', '<translation><v index="1"><s index="0"><en>Source 23</en></s><s index="1"><en>More</en></s></v></translation>'),
      assertInvalid('wrong footnote', '<translation><v index="1"><s index="0"><en>Source<sup>24</sup></en></s><s index="1"><en>More</en></s></v></translation>'),
      assertInvalid('invented footnote', '<translation><v index="1"><s index="0"><en>Source<sup>23</sup><sup>24</sup></en></s><s index="1"><en>More</en></s></v></translation>'),
      assertInvalid('duplicate s', '<translation><v index="1"><s index="0"><en>Source<sup>23</sup></en></s><s index="0"><en>More</en></s></v></translation>'),
      assertInvalid('hebrew marker copied', '<translation><v index="1"><s index="0"><en>א.</en></s><s index="1"><en>More</en></s></v></translation>')
    ]
  };
}
