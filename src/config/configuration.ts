export const configuration = () => ({
  port: +(process.env.PORT ?? 3000),
  googleDrive: {
    // clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
    // clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    // redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI,
    apiKey: process.env.GOOGLE_DRIVE_API_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    configName: process.env.GOOGLE_CONFIG_NAME,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export default configuration;
export type Configuration = ReturnType<typeof configuration>;
