module.exports = {
	apps : [
		{
			name: 'car-service-backend',
			script: './src/bin/www.js',
			watch: [
				'bin',
				'routes'
			],
			ignore_watch: [
				'node_modules'
			],
			env: {
				PORT: 4200,
				NODE_ENV: 'development',
				MySQLDB_HOST: 'content-auto-prod.cluster-cwvtgy0jxm2o.ap-northeast-2.rds.amazonaws.com',
				MySQLDB_PORT: 3306,
				MySQLDB_USER: 'auto_dev',
				MySQLDB_PASSWORD: 'auto_dev12#',
				MySQLDB_NAME: 'automobile_dev',
				Redis_HOST: 'localhost',
				Redis_PORT: 6379
            },
            env_production: {
                PORT: 4200,
				NODE_ENV: 'production',
				MySQLDB_HOST: 'content-auto-prod.cluster-cwvtgy0jxm2o.ap-northeast-2.rds.amazonaws.com',
				MySQLDB_PORT: 3306,
				MySQLDB_USER: 'auto_dev',
				MySQLDB_PASSWORD: 'auto_dev12#',
				MySQLDB_NAME: 'automobile_dev',
				Redis_HOST: 'localhost',
				Redis_PORT: 6379
            },
			env_test: {
				PORT: 80,
				NODE_ENV: 'test',
				MySQLDB_HOST: 'content-auto-prod.cluster-cwvtgy0jxm2o.ap-northeast-2.rds.amazonaws.com',
				MySQLDB_PORT: 3306,
				MySQLDB_USER: 'auto_dev',
				MySQLDB_PASSWORD: 'auto_dev12#',
				MySQLDB_NAME: 'automobile_dev',
				Redis_HOST: 'localhost',
				Redis_PORT: 6379
            },
		}
	],

	deploy : {
		production : {
		user : 'SSH_USERNAME',
		host : 'SSH_HOSTMACHINE',
		ref  : 'origin/master',
		repo : 'GIT_REPOSITORY',
		path : 'DESTINATION_PATH',
		'pre-deploy-local': '',
		'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
		'pre-setup': ''
		}
	}
};
