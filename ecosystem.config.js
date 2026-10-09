module.exports = {
  apps: [
    {
      name: "wh-delay-reason",
      script: "pnpm",
      args: "start",
      cwd: "/home/it/122-wh-delay-reason",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 4004,
      },
    },
  ],
};
