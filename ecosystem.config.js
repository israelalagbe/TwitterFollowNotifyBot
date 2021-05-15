module.exports = {
    apps: [{
            name: 'bot-server',
            script: './bin/www',
            max_memory_restart: '700M',
            exec_mode : "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 7001    
            }
        },
        {
            name: 'bot-cron',
            script: 'cron.js',
            max_memory_restart: '500M',
            exec_mode : "fork"
        }
    ]
}