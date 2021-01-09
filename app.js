const fs = require("fs");
const path = require("path");

const Nightmare = require("nightmare");
const axios = require("axios");
const moment = require("moment");

const max = 15;
const show = false;
let chongzhi = false;
let user = process.argv[2] ?
    `${process.argv[2]}_middle` :
    "9ef379cff8624139b2f76f5dc2a421f4_middle";

console.log(`使用用户：`, user);

const cookies = JSON.parse(
    fs.readFileSync(path.join(__dirname, `cookies/${user}.txt`), "utf8")
);
let pages = [],
    use_links = [];
const inArr = (arr, txt) => {
    return arr.filter((a) => a.href === txt).length !== 0;
};

const open = async() => {
    let links = [];
    for (let i = 1; i < 10; i++) {
        let data = await axios.get(
            `https://www.douyu.com/gapi/rkc/directory/mixList/2_270/${i}`
        );
        links.push(
            ...data.data.data.rl.map((d) => {
                d.href = `https://www.douyu.com${d.url}`;
                return d;
            })
        );
    }
    console.log(`获取有效页面连接数：`, links.length);
    pages.forEach((page, index) => {
        if (!inArr(links, page.href)) {
            page.ng
                .end()
                .then(() => {
                    pages.splice(index, 1);
                    console.log(`一个页面退出，当前还剩：`, pages.length);
                })
                .catch(console.log);
        }
    });
    let time = moment().format("H") * 1;
    if (chongzhi && time > 0 && time < 1) {
        chongzhi = false;
        use_links = [];
    }
    if (time > 23) chongzhi = true;
    // use_links.forEach((use_link, index) => {
    //     if (!inArr(links, use_link.href)) {
    //         use_links.splice(index, 1);
    //     }
    // });
    if (pages.length < max) {
        for (let i = 0; i < links.length; i++) {
            let link = links[i];
            // links.forEach(async link => {
            try {
                if (!inArr(pages, link.href) && !inArr(use_links, link.href)) {
                    use_links.push({ href: link.href });
                    let ng_page = Nightmare({
                        show,
                    });
                    let title = await ng_page
                        .viewport(1920, 1080)
                        .useragent(
                            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11"
                        )
                        .goto(link.href, { referrer: "https://www.douyu.com/g_jdqs" })
                        .cookies.set(cookies)
                        .wait(1000 * 3)
                        .scrollTo(5000, 0)
                        .title();
                    console.log(title, `当前已经打开：`, pages.length + 1);
                    if (title !== "绝地求生空投") {
                        //title !== '绝地求生空投' && '斗鱼直播星声请出道'
                        await ng_page.end();
                    } else {
                        pages.push({
                            href: link.href,
                            ng: ng_page,
                        });
                        // console.log(`当前已经打开：`, pages.length)
                        if (pages.length >= max) break;
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    } else {
        console.log(`当前页面已经达到${max}个，等待其中有页面退出`);
    }
    fs.writeFileSync(
        path.join(__dirname, "use_links.json"),
        JSON.stringify(use_links, null, 2)
    );
    console.log(`等待10秒后再刷新...`);
    setTimeout(open, 1000 * 10);
};

// nightmare
//     .viewport(1920, 1080)
//     .useragent(
//         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11"
//     )
//     .goto("https://www.douyu.com/g_jdqs")
//     .cookies.set(cookies)
//     .wait(1000 * 3)
//     .evaluate(function() {
//         return document.querySelector("img.Avatar-img").src;
//     })
//     .then((img) => {
//         if (img === `https://apic.douyucdn.cn/upload/avatar_v3/202001/${user}.jpg`)
//             console.log(`用户登陆成功`);
//         console.log(`当前用户：`, img);
//         open(nightmare);
//     })
//     .catch(console.log);

// let run_time = 60 * 60 * 5.5
// let run_now = 0

// setInterval(() => {
//     run_now++
//     let s = run_time - run_now
//     if (run_now % 5 === 0) console.log(`已经运行:`, (run_now - run_now % 60) / 60, '分', run_now % 60, '秒.', '还剩', (s - s % 60) / 60, '分', s % 60, '秒.')
//     if (s <= 0) process.exit()
// }, 1000)

open();