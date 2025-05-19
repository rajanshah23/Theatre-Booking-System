import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    id: 1,             
    role: "Admin",    
  },
  process.env.JWT_SECRET_KEY || "your_super_secret_key", 
  { expiresIn: "1d" }
);

console.log("Generated Admin JWT:\n", token);
