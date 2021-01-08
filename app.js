const fs = require('fs');
const path = require('path');

const max = 10;
const show = false;

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

const cookies = JSON.parse(fs.readFileSync(path.join(__dirname, 'cookies.txt'), 'utf8'));
const pages = [];
const inArr = (arr, txt) => {
    return arr.filter(a => a.href === txt).length !== 0
}

const open = ng_main => {
    ng_main
        .refresh()
        .wait(1000 * 3)
        .scrollTo(5000, 0)
        .evaluate(function() {
            let links = document.querySelectorAll("a.DyListCover-wrap") //.getElementsByClassName("DyListCover-wrap"))
            let listArr = [],
                listObj = {},
                len = links.length;
            for (let i = 0; i < len; i++) {
                listObj.title = links[i].innerText;
                listObj.href = links[i].href;
                listArr.push(listObj);
                listObj = {};
            }
            return listArr;
        })
        .then(async links => {
            pages.forEach((page, index) => {
                if (!inArr(links, page.href)) {
                    page.ng.end().then(() => {
                        pages.splice(index, 1)
                        console.log(`一个页面退出，当前还剩：`, pages.length)
                    }).catch(console.log)
                }
            })
            if (pages.length < max) {
                for (let i = 0; i < links.length; i++) {
                    let link = links[i];
                    // links.forEach(async link => {
                    try {
                        if (!inArr(pages, link.href)) {
                            let ng_page = Nightmare({
                                show
                            });
                            let title = await ng_page
                                .viewport(1920, 1080)
                                .goto(link.href)
                                .cookies.set(cookies)
                                .wait(1000 * 3)
                                .scrollTo(5000, 0)
                                .title();
                            console.log(title, `当前已经打开：`, pages.length);
                            if (title !== '绝地求生空投') {
                                await ng_page.end();
                            } else {
                                pages.push({
                                    href: link.href,
                                    ng: ng_page
                                });
                                // console.log(`当前已经打开：`, pages.length)
                                if (pages.length >= max) break
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            } else {
                console.log(`当前页面已经达到${max}个，等待其中有页面退出`)
            }
            console.log(`等待10秒后再刷新...`)
            setTimeout(() => open(ng_main), 1000 * 10)
        })
        .catch(console.log)
}

nightmare
    .viewport(1920, 1080)
    .goto('https://www.douyu.com/g_jdqs')
    .cookies.set(cookies)
    .wait(1000 * 3)
    .evaluate(function() {
        return document.querySelector("img.Avatar-img").src
    })
    .then(img => {
        if (img === 'https://apic.douyucdn.cn/upload/avatar_v3/202001/9ef379cff8624139b2f76f5dc2a421f4_middle.jpg') console.log(`用户登陆成功`)
        console.log(`当前用户：`, img)
        open(nightmare)
    })
    .catch(console.log)

let run_time = 60 * 70
let run_now = 0

setInterval(() => {
    run_now++
    console.log(`已经运行:`, (run_now - run_now % 60) / 60, '分', run_now % 60, '秒')
    if (run_now >= run_time) process.exit()
}, 1000)