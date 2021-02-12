const express = require('express')//express module 가져옴
const app = express()//새로운 express app 만듦
const port = 5000
const bodyParser = require('body-parser');

const config = require('./config/key')


const { User } = require("./models/User");//DB Schema

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());


//mongoose : 몽고DB를 편하게 쓸 수 있는 Object Modeling Tool
const mongoose = require('mongoose') 
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false//에러 방지
}).then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! Nodemon!'))//root directory에 Hello World! 출력

app.listen(port, () => console.log(`Example app listening on port ${port}!`))// ` : backquote, 키보드 ~ 위치


app.post('/register', (req, res) => {
    //회원 가입 할 때 필요한 정보들을 client에서 가져오면
    //그것들을 DB에 넣어준다.

    const user = new User(req.body)

    user.save((err,doc) => {
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})


//NODE MON : 소스를 변경할 때 그것을 감지해서 자동으로 서버를 재시작해주는 tool