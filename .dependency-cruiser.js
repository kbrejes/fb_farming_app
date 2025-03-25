module.exports = {
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: 'node_modules',
    },
    prefix: 'https://github.com/your-username/your-repo/blob/main/',
  },
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Циклические зависимости запрещены',
      from: {},
      to: {
        circular: true
      }
    }
  ]
}; 