module: {
  rules:[
    {
      test: /(\.jsx|\.js)$/,
      use:{
        loader: 'babel-loader',
        options:{
          "presets": ["@babel/preset-react", "@babel/preset-env"],
          "plugins": ["@babel/plugin-transform-runtime"]
      }
      },
       exclude:/node_modules/
    }
  ]
}