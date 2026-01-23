const express = require('express');
const Model = require('../models/UserModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const router = express.Router();



//Register user
router.post('/register',(req, res) => {
    console.log(req.body);
    new Model(req.body).save()
    .then((result) =>{
        res.status(200).json(result);
    })
    .catch((err) =>{
        console.log(err);
        res.status(500).json(err);    
    });   
});

//getall users
router.get('/getall',(req, res)=> {
    Model.find()
    .then((result)=> {
        res.status(200).json({message: "Users fetched successfully", data: result});
    })
    .catch((err)=> {
        res.status(500).json({message: "Error fetching users", error: err});
    });
});
//url params
router.get('/getbyemail/:email',(req, res)=>{
    Model.findOne({email: req.params.email})
    .then((result)=>{
        res.status(200).json({message: "User fetched successfully", data: result});
    })
    .catch((err)=>{
        res.status(500).json({message: "Error fetching user", error: err});
    });
});

//getbyid
router.get('/getbyid/:id',(req, res)=>{
    Model.findById(req.params.id)
    .then((result)=>{               
      res.status(200).json({message: "User fetched successfully", data: result});
    })
    .catch((err)=>{
        res.status(500).json({message: "Error fetching user", error: err});
    });
});

router.delete('/delete/:id',(req, res)=>{   
    Model.findByIdAndDelete(req.params.id)
    .then((result)=>{
        res.status(200).json({message: "User deleted successfully", data: result});
    })
    .catch((err)=>{
        res.status(500).json({message: "Error deleting user", error: err});
    });
});

router.put('/update/:id',(req, res)=>{
    Model.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((result)=>{
        res.status(200).json({message: "User updated successfully", data: result});     
})
 .catch((err)=>{
        res.status(500).json({message: "Error updating user", error: err});
    });
});

router.post('/authenticate',(req, res) => {
    const {email, password} = req.body;
    Model.findOne({email, password})
    .then((result) => {

        if(result){
            // create token
            const {_id, email} = result;

            jwt.sign(
              {_id, email},
              process.env.JWT_SECRET,
              {expiresIn:'1h'},
              (err, token) =>{
                if (err){
                    console.log(err);
                    res.status(500).json(err);
                }else{
                    res.status(200).json({token, _id, email});
                }
                
              }
            )

        }else{
            res.status(401).json({message: 'Invalid credentials'});
        }

    }).catch((err) =>{
        console.log(err);
        req.status(500).json(err);
        
    });
})


module.exports = router;