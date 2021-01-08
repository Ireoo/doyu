const fs = require('fs');
const path = require('path');

const show = true;

const Nightmare = require('nightmare');

const nightmare = Nightmare({
    // webPreferences: {
    //     preload: path.resolve('./jquery.js')
    //         //alternative: preload: "absolute/path/to/custom-script.js"
    // },
    // openDevTools: {
    //     mode: 'detach'
    // },
    show
});

nightmare
    .viewport(1920, 1080)
    .useragent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11')
    .goto('https://www.douyu.com/g_jdqs')
    // .cookies.set(cookies)
    .wait(1000 * 3)
    .evaluate(function() {
        return document.querySelector("div.UnLogin") ? true : false
    })
    .then(() => {
        let timer = setInterval(() => {
            nightmare.evaluate(function() {
                    return document.querySelector("img.Avatar-img") ? document.querySelector("img.Avatar-img").src : false
                }).then(img => {
                    if (img) {
                        clearInterval(timer)
                        console.log(img)
                        let files = img.split("/")
                        let file = files[files.length - 1]
                        file = file.split(".")[0]
                        console.log(`file ->`, file)
                        nightmare.cookies.get().end().then(cookies => {
                                fs.writeFileSync(path.join(__dirname, `cookies/${file}.txt`), JSON.stringify(cookies))
                            })
                            .catch(console.log)
                    }
                })
                .catch(console.log)
        }, 1000)
    })
    .catch(console.log)