const jwt = require('jsonwebtoken');

function accessToken(req,res,next) {
  try{

    const token = req.headers.authorization.split(' ')[1];
    const decoded  = jwt.verify(token,process.env.ACCESS_KEY);
    req.currentUser =decoded;
    
    next();
   
  }
  catch(err){
   return res.json({
     success:false,
     message:'Session is Expired',
     data:err
   })
  }
  

}
function refreshToken(req,res,next) {
 
  try{

    const token = req.headers.authorization.split(' ')[1];
    const decoded  = jwt.verify(token,process.env.SECRET_KEY);
    req.currentUser =decoded;
    
    next();
   
  }
  catch(err){
   return res.json({
     success:false,
     message:'Session is Expired',
     data:err
   })
  }
  
}
module.exports.refreshToken = refreshToken;
module.exports.accessToken = accessToken;
