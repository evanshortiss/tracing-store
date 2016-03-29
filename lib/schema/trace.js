module.exports = {
  type: 'object',
  properties: {
    method: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    headers: {
      type: 'object'
    },
    appId: {
      type: 'string'
    },
    spans: {
      type: 'array',
      items: {
        type: 'array',
        items: require('./span')
      }
    },
    uuid: {
      type: 'string'
    }
  },

  required: [
    'method',
    'url',
    'headers',
    'appId',
    'spans',
    'uuid'
  ]
};
