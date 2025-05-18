import { User } from "./database/models/User";
import { envConfig } from "./config/config";

const adminSeeder = async () => {
  const [data] = await User.findAll({
    where: {
      email: envConfig.adminEmail,
    },
  });
  if (!data) {
    await User.create({
      username: envConfig.adminUsername,
      password: envConfig.adminPassword,
      email: envConfig.adminEmail,
      role: "admin",
    });
    console.log("Admin seeded");
  } else {
    console.log("admin already seeded");
  }
};
export default adminSeeder;
