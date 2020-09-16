import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';

const articlesInfo = {
    'learn-react': {
        upvotes: 0,
        comments: []
    },
    'learn-node': {
        upvotes: 0,
        comments: []
    },
    'my-thoughts-on-resumes': {
        upvotes: 0,
        comments: []
    }
}

const app = express();

app.use(express.static(path.join(__dirname, '/build')));

app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try{
        const client = await MongoClient.connect('mongodb+srv://admin:admin@cluster0.n3pww.mongodb.net/<dbname>?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
        const db = client.db('');
        await operations(db);
    }catch(error){
        res.status(500).json({message: 'Error connecting to database'})
    }
}

app.get('/api/articles/:name', async (req, res) => {

    withDB(async(db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(articleInfo);
    })

})

app.post('/api/articles/:name/upvote', async (req, res)=> {

    withDB(async(db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name: articleName}, {
            '$set': {
                upvotes: articleInfo.upvotes + 1
            },
        })
        const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(updatedArticleInfo);
    })

})

app.post('/api/articles/:name/add-comment', (req,res)=>{
 const {username, text} = req.body;
 console.log(req.body);
 const articleName = req.params.name;

 withDB(async(db)=>{
     const articleInfo = await db.collection('articles').findOne({name: articleName})
     await db.collection('articles').updateOne({name: articleName}, {
         '$set': {
             comments: articleInfo.comments.concat({username, text})
         }
     })
     const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});
     res.status(200).json(updatedArticleInfo);
 })
});

app.get('*', (req, res) => {
    res.sendFile(path, join(__dirname + '/build/index.html'));
});
app.listen(8000, ()=>console.log('Listening on port 8000'));