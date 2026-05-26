/**
B"H
social media handler
**/
class AwtsmoosSocialHandler {
  constructor(baseEndpoint, subPath) {
    this.baseEndpoint = baseEndpoint;
    this.subPath = subPath || "";
  }

  async endpoint(
    path, {
      method = 'GET',
      body = null, headers = {}
    } = {}
  ) {
    var params = body ? new URLSearchParams(body).toString() : null;
    var realPath = this.baseEndpoint + this.subPath + "/" + path;

    var response = await fetch(realPath, {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
      },
      credentials: 'include',
      body: params,
    });

    var text = await response.text();
    var parsed = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        return {
          error: {
            code: 'INVALID_JSON',
            message: error.message || 'Invalid JSON response',
            raw: text
          }
        };
      }
    }

    if (!response.ok) {
      return {
        error: {
          code: response.status,
          message: response.statusText,
          details: parsed
        }
      };
    }

    return parsed;
  }

  async fetchEntities(endpoint, options={}) {
    return await this
    .endpoint(endpoint, {
      method: 'GET',...options
    });
  }

  async createEntity({ entityType, newEntityData }) {
    return await this.endpoint(entityType, {
      method: 'POST', body: newEntityData
    });
  }

  async editEntity({entityId, entityType, updatedData}) {
	var cleansedObj = {};
	if(updatedData && typeof(updatedData) == "object") 
		for(var k in updatedData) {
			if(
				updatedData[k] ||
				updatedData[k] === 0
			) {
				cleansedObj[k] = 
				updatedData[k];
			}
		}
    return await this.endpoint(
      entityType+"/"+entityId, 
      { method: 'PUT', body: cleansedObj }
    );
  }

  async deleteEntity(endpoint) {
    return await this.endpoint(endpoint, { method: 'DELETE' });
  }






  createAlias(aliasName) {
    return this.postData('/aliases', { aliasName });
  }

  //for /heichelos/:heichel
  async getHeichel(heichel) {
    return await this.fetchEntities(`/heichelos/${heichel}`)
  }

  async getPost(
    postId

  ) {
    return await 
    this.fetchEntities(
      "/posts/"+
      postId
      

    )

  }


  /**
   * @function postData
   * @param {string} urlExtension - The specific celestial path within the labyrinth of endpoints.
   * @param {Object} data - The sacred elements that shall be manifested.
   * @description: This method sends a POST request, like a whispered prayer, to create new celestial entities within the digital cosmos.
   * @returns {Promise} - An eternal promise of creation or explanation.
   */
  async postData(urlExtension, data) {
    return await this.endpoint(urlExtension.replace(/^\//, ''), {
      method: 'POST',
      body: data
    });
  }

}

export default AwtsmoosSocialHandler;
