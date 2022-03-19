module.exports = {
    apps: [{
            name: 'bot-server',
            script: './bin/www',
            max_memory_restart: '300M',
            exec_mode : "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 7001    
            },
            instances: "2"
        },
        {
            name: 'bot-cron',
            script: 'cron.js',
            max_memory_restart: '300M',
            exec_mode : "fork",
            instances:"1"
        }
    ]
}