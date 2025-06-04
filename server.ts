import adminSeeder from './src/adminSeeder';
import app from './src/app';
import { envConfig } from './src/config/config';
import { sequelize } from './src/database/connection';

function startServer() {
  const port = envConfig.port || 4000
  adminSeeder()
  app.listen(port, () => {
    console.log(`Server has started at port [${port}]`);
  });
}
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Tables created successfully!');
    startServer();
  })
  .catch((err) => {
    console.error('Error on creating tables:', err);
  });
