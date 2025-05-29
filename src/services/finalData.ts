const finalData = async (model: any, email: string) => {
  
  return await model.findOne({ where: { email } });
};
 

export default finalData;
