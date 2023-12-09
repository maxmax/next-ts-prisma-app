module.exports = function (api) {
  const isServer = api.caller((caller) => caller?.isServer)
  const isCallerDevelopment = api.caller((caller) => caller?.isDev)
  
  // пресети
  const presets = [
		[
			'next/babel',
			{
				'preset-react': {
					runtime: 'automatic',
					importSource:
						// код wdyr повинен виконуватися лише на клієнті
						// і лише у режимі розробки
						!isServer && isCallerDevelopment
							? '@welldone-software/why-did-you-render'
							: 'react'
				}
			}
		]
  ]

  // плагіни
  const plugins = [
    [
      'babel-plugin-import',
      {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false
      },
      'core'
    ]
  ]
  
  return { presets, plugins }
}