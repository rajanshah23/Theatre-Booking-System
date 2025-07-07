import { sequelize } from './database/connection';

(async () => {
  try {
    await sequelize.sync({force:false });
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();
