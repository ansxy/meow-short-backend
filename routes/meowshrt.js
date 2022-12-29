
const dotenv = require('dotenv');
const router = require("express").Router();
dotenv.config()
const validate =require('../utils/validate')
const meowshort = require('../model/meowshort');
const shortid = require('shortid');

router.post('/short',async (req,res) => {
    const {origUrl} = req.body
    const base = process.env.BASE_URL

    const urlId = shortid.generate()
    if (validate.validateUrl(origUrl)){
        try {
            let url = await meowshort.findOne({origUrl})
            if(url) {
                res.status(409).json({
                    status : 'Same Data',
                    data : url
                })
            } else {
                const shortUrl = `${base}/${urlId}`
                
                url = new meowshort({
                    origUrl,
                    shortUrl,
                    urlId,
                    date : new Date()
                });
                await url.save()
                res.status(200).json({
                    status : 'success',
                    data : url
                })
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ status : 'error', data : 'Server error' })
        }
    }else {
        res.status(400).json({ status : 'error', data : 'Invalid Original Url' })
    }
})

router.get('/:urlId',async(req,res) => {
    try {
        const url = await meowshort.findOne({
            urlId : req.params.urlId
        })
        if(url) {
            url.clicks++
            url.save()
            return res.redirect(url.origUrl)
        }else{
            res.status(404).json({ status : 'error', data : 'no url found' })
        }
    }catch(e){
        console.error(e)
        res.status(500).json({ status : 'error', data :'server error' })
    }
})

module.exports = router