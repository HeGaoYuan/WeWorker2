# Official website icon sources

Icons are maintained at `adapters/<website>/icon.png` or `icon.svg`. This file records provenance only; it is not a build input. The desktop packages each icon with its Adapter and reads the currently selected package at runtime. Variant repositories own their corresponding Adapter icons.

Audited all 33 bundled website icons on 2026-10-20. Assets come from official websites, official static hosts, or the corresponding publisher's Apple App Store listing. Bundled locally for offline display; trademarks remain the property of their owners.

Raster replacements retain native resolution and colors (format conversion to PNG only), except the documented 12306 symbol crop. No small bitmap was enlarged. Three official SVG sources are rendered to 256 px PNGs for the existing asset pipeline; Hacker News remains SVG. Previously adequate raster assets are retained, including earlier conversions capped at 128 px. At 34 CSS px / 2x density every bitmap has sufficient source pixels; the automated guard allows up to 40 CSS px / 2x density. Dimensions alone do not prove clarity, so all icons are also visually reviewed at actual display size.

| Website | Official source | Bundled dimensions | Processing / provenance |
| --- | --- | --- | --- |
| ctrip.com | https://pic.c-ctrip.com/h5/common/144.png?v=1.0 | 144 x 144 | Retained previously bundled official asset. |
| bilibili.com | https://i0.hdslb.com/bfs/activity-plat/static/20220518/49ddaeaba3a23f61a6d2695de40d45f0/U16vgUX6Te.png | 216 x 100 | Official app download page wordmark; native size. |
| mail.qq.com | https://res.wx.qq.com/t/webmail/webmail/res/images/qqmail_favicon_96h.8d124a7.png | 96 x 96 | Retained previously bundled official asset. |
| mail.163.com | https://mimg.127.net/xm/dashi-official-site-pc/static/media/logo.efeafbe2.svg | 256 x 256 | Official NetEase Mail Master header SVG: crop symbol with viewBox 0 0 30 30; render at 256 x 256. |
| mail.google.com | https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico | 128 x 128 | Retained previously bundled official asset. |
| jd.com | https://storage.360buyimg.com/retail-mall/mall-common-component/favicon.ico | 96 x 96 | Retained previously bundled official asset. |
| juejin.cn | https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/static/favicons/apple-touch-icon.png | 128 x 128 | Retained previously bundled official asset. |
| xiaohongshu.com | https://picasso-static.xiaohongshu.com/fe-platform/f43dc4a8baf03678996c62d8db6ebc01a82256ff.png | 180 x 180 | Retained previously bundled official asset. |
| nnfp.jss.com.cn | https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1c/76/b4/1c76b44a-e82d-8d10-d8c2-90d7de1149bc/AppIcon-1x_U007emarketing-0-6-0-85-220-0.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 1072318187; publisher: Nuonuo Technology Co.,Ltd.. |
| 12306.cn | https://www.12306.cn/index/images/logo@2x.png | 84 x 100 | Official header: crop left symbol (0, 0, 84, 100) from 400 x 100; no scaling. |
| 51job.com | https://fecdn.51jobcdn.com/fe/public/icons/favicon51.ico | 128 x 128 | Retained previously bundled official asset. |
| note.youdao.com | https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/33/69/a1/3369a1f0-8160-19ad-4dba-bbd4358a8021/AppIcon-0-1x_U007emarketing-0-11-0-85-220-0.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 450748070; publisher: Hangzhou NetEase Bamboo Mail Technology Co., Ltd.. |
| dianping.com | https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/98/35/bc/9835bc62-a815-2b8d-32fd-fd25fbe75e82/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 351091731; publisher: Hanhai Information Technology (Shanghai) Co.Ltd. |
| douyin.com | https://lf-douyin-pc-web.douyinstatic.com/obj/douyin-pc-web/2025_0313_logo.png | 144 x 144 | Official high-resolution image; native size. |
| douban.com | https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/79/54/c5/7954c588-8484-b8cb-747b-9f94e897ac22/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 907002334; publisher: Beijing Douwang Technology Company Limited. |
| zhihu.com | https://static.zhihu.com/heifetz/assets/apple-touch-icon-152.81060cab.png | 128 x 128 | Retained previously bundled official asset. |
| zhipin.com | https://static.zhipin.com/zhipin-geek-seo/v5481/h5/wap/images/screen-icon.png | 400 x 400 | Retained previously bundled official asset. |
| news.ycombinator.com | https://news.ycombinator.com/y18.svg | SVG | Retained previously bundled official asset. |
| 36kr.com | https://staticx.36krcdn.com/36kr-web/static/ic_36kr_logo_68_38@2x.187cd924.png | 144 x 76 | Retained previously bundled official asset. |
| wikipedia.org | https://www.wikipedia.org/static/apple-touch/wikipedia.png | 160 x 160 | Official high-resolution image; native size. |
| github.com | https://github.githubassets.com/favicons/favicon.svg | 256 x 256 | Official favicon SVG rendered directly at 256 x 256. |
| toutiao.com | https://sf3-cdn-tos.douyinstatic.com/obj/eden-cn/uhbfnupkbps/toutiao_favicon.ico | 128 x 128 | Retained previously bundled official asset. |
| smzdm.com | https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/25/1a/fc/251afcc5-e765-908c-c9ca-dcda1239ff2c/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 518213356; publisher: Beijing Zhidemai Technology Co., Ltd.. |
| arxiv.org | https://arxiv.org/static/browse/0.3.4/images/icons/apple-touch-icon.png | 128 x 128 | Retained previously bundled official asset. |
| tieba.baidu.com | https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/7a/1e/74/7a1e74e5-262e-ef03-55a2-3d55d7eacd11/AppIcon-0-0-1x_U007emarketing-0-8-0-sRGB-85-220.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 477927812; publisher: Beijing Baidu Netcom Science & Technology Co.,Ltd. |
| gitee.com | https://gitee.com/static/images/logo.svg | 256 x 256 | Official SVG: isolate original Group symbol with viewBox 0 0 90 90; render at 256 x 256. |
| v2ex.com | https://www.v2ex.com/static/icon-192.png | 128 x 128 | Retained previously bundled official asset. |
| weread.qq.com | https://rescdn.qqmail.com/node/wr/wrpage/style/images/independent/appleTouchIcon/apple-touch-icon-152x152.png | 152 x 152 | Retained previously bundled official asset. |
| xueqiu.com | https://xqdoc.imedao.com/18c247c0f182c8e03fef6b0c.png | 512 x 512 | Official high-resolution image; native size. |
| weibo.com | https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/38/2d/a6/382da6e2-3db6-e8dd-ac06-57f54bfd6f25/WeiboAppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 350962117; publisher: SINA Corporation. |
| 1688.com | https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c7/c9/09/c7c909c6-b3f3-bfad-c6b7-87b1a0a9696b/AppIcon-0-0-1x_U007emarketing-0-6-0-sRGB-85-220.png/512x512bb.jpg | 512 x 512 | Official app artwork, 512 px; Apple app ID 507097717; publisher: Hangzhou AliBaba Advertising Co., Ltd.. |
| goofish.com | https://img.alicdn.com/tfs/TB19WObTNv1gK0jSZFFXXb0sXXa-144-144.png | 128 x 128 | Retained previously bundled official asset. |
| x.com | https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png | 1024 x 1024 | Official high-resolution image; native size. |

App identities and publisher names were checked through Apple lookup/search metadata. Bilibili uses the wordmark referenced by https://app.bilibili.com/ rather than seasonal promotional app artwork. Xueqiu uses the 512 px icon declared in its official web manifest. Mail 163 uses its official Mail Master product symbol.
