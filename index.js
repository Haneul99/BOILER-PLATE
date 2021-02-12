const express = require('express')//express module 가져옴
const app = express()//새로운 express app 만듦
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key')

const { auth } = require('./middleware/auth');
const { User } = require("./models/User");//DB Schema

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());


//mongoose : 몽고DB를 편하게 쓸 수 있는 Object Modeling Tool
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false//에러 방지
}
).then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! Nodemon!'))//root directory에 Hello World! 출력



app.post('/api/users/register', (req, res) => {
    //회원 가입 할 때 필요한 정보들을 client에서 가져오면
    //그것들을 DB에 넣어준다.

    const user = new User(req.body)

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
})


app.post('/api/users/login', (req, res) => {
    //요청된 이메일을 DB에서 있는지 찾는다.
    //요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인한다.
    //비밀번호까지 맞다면 토큰을 생성한다.

    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등의 방법. 여기서는 쿠키에 저장
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})


app.get('/api/users/auth', auth, (req, res) => {

    //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})


app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id },
        { token: "" },
        (err, user) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        })
})



//NODE MON : 소스를 변경할 때 그것을 감지해서 자동으로 서버를 재시작해주는 tool


app.listen(port, () => console.log(`Example app listening on port ${port}!`))// ` : backquote, 키보드 ~ 위치