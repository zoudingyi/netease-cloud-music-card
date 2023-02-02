require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const { user_record, song_detail, user_account } = require('NeteaseCloudMusicApi');
const axios = require('axios').default;

async function getBase64(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
}

const {
    USER_ID,
    USER_TOKEN,
    GH_TOKEN,
    AUTHOR,
    REPO,
} = process.env;

(async () => {
    const account = await user_account({
        cookie: `MUSIC_U=${USER_TOKEN}`,
    })
    const username = account.body.profile.nickname;
    const avatarUrl = account.body.profile.avatarUrl + "?param=128y128"; // 压缩
    console.log(`用户名：${username}\n个人头像: ${avatarUrl}`);

    /*
      获取歌单记录
    */
   
    const record = await user_record({
        cookie: `MUSIC_U=${USER_TOKEN}`,
        uid: USER_ID,
        type: 1,
    }).catch(error => console.error(`无法获取用户播放记录 \n${error}`));

    const content = record.body;
    const songId = content.weekData[0].song.id + '';
    const songLink = "https://music.163.com/#/song?id=" + songId
    const songName = content.weekData[0].song.name.replace("&", "&amp;");
    const songAuthorArray = content.weekData[0].song.ar;
    const playCount = content.weekData[0].playCount;

    const songAuthors = songAuthorArray.map(i => i.name).join(' / ');

    const songDetail = await song_detail({
        cookie: `MUSIC_U=${USER_TOKEN}`,
        ids: songId,
    }).catch(error => console.error(`无法获取歌曲信息 \n${error}`));

    const songCover = songDetail.body.songs[0].al.picUrl + "?param=300y300";

    console.log(`歌曲名：${songName}\n歌曲链接：${songLink}\n歌曲作者：${songAuthors}\n歌曲封面：${songCover}\n播放次数：${playCount}`);

    var svgContent = "";
    try {
        svgContent = Buffer.from(
`<svg width="530" height="280" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
   <a href="${songLink}">
    <foreignObject width="530" height="280">
        <div xmlns="http://www.w3.org/1999/xhtml" class="container" style="padding: 5px;">
            <style>
            * {
                box-sizing: border-box;
                image-rendering: crisp-edges;
                image-rendering: -webkit-optimize-contrast;
                color:black;
                font-size: 0;
            }

            html, body {
                margin: 0;
                padding: 3px;
            }

            p {
                margin: 0;
                padding: 0;
            }

            img {
                margin: 0;
                padding: 0;
            }

            .clear {
                clear: both;
            }

            .card {
                display: inline-block;
                background: white;
                border-radius: 10px;
                text-align: center;
                box-shadow: gray 0 0 10px;
                overflow: hidden;
            }

            .user {
                text-align: left;
                margin: 10px;
            }

            .avatar {
                width: 32px;
                height: 32px;
                border-radius: 100%;
                vertical-align: middle;
            }

            .username {
                line-height: 32px;
                vertical-align: middle;
                font-size: 14px;
                margin-left: 5px;
            }

            .macOS {
                background: #28C131;
                width: 16px;
                height: 16px;
                border-radius: 100%;
                vertical-align: middle;
                float: right;
                margin-top: 8px;
                margin-right: 3px;
            }
            
            .most-music {
                display: flex;
                padding: 10px;
            }
            .most-music .cover-box {
                position: relative;
                width: 198px;
                height: 198px;
                animation: rotation 25s linear infinite;
            }
            .most-music .cover-box img {
                position: absolute;
                top: 0;
                left: 0;
            }
            .most-music .cover-box .cover {
                width: 130px;
                height: 130px;
                margin: 34px;
            }
            .most-music .cover-box .msk {
                width: 100%;
                height: 100%;
            }

            @keyframes rotation {
                from {
                    transform:rotate(0deg);
                }
                to {
                    transform:rotate(360deg);
                }
            }
            .music-list {
                position: relative;
                width: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .song {
                margin: 0 auto;
                width: 260px;
                margin-top: 10px;
                font-size: 16px;
                font-weight: bold;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .singer {
                margin: 0 auto;
                width: 260px;
                margin-top: 5px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                opacity: 0.5;
                font-size: 14px;
            }
            .hello {
                position: absolute;
                top: 20px;
            }
            .neteasecloud {
                width: 32px;
                height: 32px;
                vertical-align: middle;
                margin-right: 10px;
            }

            .intro {
                vertical-align: middle;
                color: #BA0400;
                font-size: 16px;
                margin-right: 5px;
            }
            </style>

            <div class="card">
                <div class="user">
                    <img class="avatar" src="data:image/jpg;base64,${await getBase64(avatarUrl)}"/>
                    <a class="username">${username}</a>
                    <a class="button"></a>
                    <div class="clear"></div>
                </div>
                <div class="most-music">
                <div class="cover-box">
                    <img class="cover" src="data:image/jpg;base64,${await getBase64(songCover)}" />
                    <img class="msk" src="data:image/jpg;base64,${await getBase64('https://s2.music.126.net/style/web2/img/ie6/singlecover.png')}" />
                </div>
                <div class="music-list">
                    <div class="hello">
                        <img class="neteasecloud" src="data:image/jpg;base64,${await getBase64('https://s1.music.126.net/style/favicon.ico')}" />
                        <a class="intro">这周正在听：</a>
                    </div>
                    <div>
                        <p class="song" title="${songName}">${songName}</p>
                        <p class="singer">${songAuthors}</p>
                    </div>
                </div>
                </div>
            </div>

        </div>
    </foreignObject>
   </a>
</svg>
`
        ).toString("base64");
    } catch(err) {
        console.error(`处理 SVG 时发生了错误：${err}`);
    }

    try {
        const octokit = new Octokit({
            auth: GH_TOKEN,
        });

        const {
            data: { sha: svgSha }
        } = await octokit.git.createBlob({
            owner: AUTHOR,
            repo: REPO,
            content: svgContent,
            encoding: "base64"
        });

        const commits = await octokit.repos.listCommits({
            owner: AUTHOR,
            repo: REPO,
        });
        const lastSha = commits.data[0].sha;
        const {
            data: { sha: treeSHA }
        } =  await octokit.git.createTree({
            owner: AUTHOR,
            repo: REPO,
            tree: [
                {
                    mode: '100644',
                    path: "card.svg",
                    type: "blob",
                    sha: svgSha
                }
            ],
            base_tree: lastSha,
        });
        const {
            data: { sha: newSHA }
        } =  await octokit.git.createCommit({
            owner: AUTHOR,
            repo: REPO,
            author: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            committer: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            tree: treeSHA,
            message: 'Update SVG periodically',
            parents: [ lastSha ],
        });
        const result = await octokit.git.updateRef({
            owner: AUTHOR,
            repo: REPO,
            ref: "heads/main",
            sha: newSHA,
        });
        console.log(result);
    } catch(err) {
        console.error(`上传 SVG 时发生了错误：${err}`);
    }

})();

