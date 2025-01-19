import express from "express";
import db from "../db/db.js";

const router = express.Router();

//Middleware to parse the x-www-form-urlencoded payloads
router.use(express.urlencoded({extended:true}));

router.post('/add-income', async (req,res) => {
    
});

export default router;

router.get('/income', async (req, res) => {
    
});
