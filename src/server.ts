import adminSeeder from './adminSeeder';
import app from './app';
import { envConfig } from './config/config';
import { sequelize } from './database/connection';

function startServer() {
  const port =process.env.PORT || 4000
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
