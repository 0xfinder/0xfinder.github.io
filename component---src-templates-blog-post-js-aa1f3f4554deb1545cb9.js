(self.webpackChunkgatsby_starter_blog_dev_mdx=self.webpackChunkgatsby_starter_blog_dev_mdx||[]).push([[989],{67228:function(e){e.exports=function(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n},e.exports.__esModule=!0,e.exports.default=e.exports},23646:function(e,t,r){var n=r(67228);e.exports=function(e){if(Array.isArray(e))return n(e)},e.exports.__esModule=!0,e.exports.default=e.exports},69100:function(e,t,r){var n=r(99489),o=r(57067);function a(t,r,c){return o()?(e.exports=a=Reflect.construct,e.exports.__esModule=!0,e.exports.default=e.exports):(e.exports=a=function(e,t,r){var o=[null];o.push.apply(o,t);var a=new(Function.bind.apply(e,o));return r&&n(a,r.prototype),a},e.exports.__esModule=!0,e.exports.default=e.exports),a.apply(null,arguments)}e.exports=a,e.exports.__esModule=!0,e.exports.default=e.exports},59713:function(e){e.exports=function(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e},e.exports.__esModule=!0,e.exports.default=e.exports},57067:function(e){e.exports=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}},e.exports.__esModule=!0,e.exports.default=e.exports},46860:function(e){e.exports=function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)},e.exports.__esModule=!0,e.exports.default=e.exports},98206:function(e){e.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},e.exports.__esModule=!0,e.exports.default=e.exports},319:function(e,t,r){var n=r(23646),o=r(46860),a=r(60379),c=r(98206);e.exports=function(e){return n(e)||o(e)||a(e)||c()},e.exports.__esModule=!0,e.exports.default=e.exports},60379:function(e,t,r){var n=r(67228);e.exports=function(e,t){if(e){if("string"==typeof e)return n(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(e,t):void 0}},e.exports.__esModule=!0,e.exports.default=e.exports},46725:function(e,t,r){var n=r(93395);e.exports={MDXRenderer:n}},93395:function(e,t,r){var n=r(69100),o=r(319),a=r(59713),c=r(37316),l=["scope","children"];function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var u=r(67294),p=r(64983).mdx,f=r(89480).useMDXScope;e.exports=function(e){var t=e.scope,r=e.children,a=c(e,l),i=f(t),d=u.useMemo((function(){if(!r)return null;var e=s({React:u,mdx:p},i),t=Object.keys(e),a=t.map((function(t){return e[t]}));return n(Function,["_fn"].concat(o(t),[""+r])).apply(void 0,[{}].concat(o(a)))}),[r,t]);return u.createElement(d,s({},a))}},29535:function(e,t,r){"use strict";var n=r(67294),o=r(25444),a=r(6125);t.Z=function(){var e,t,c=(0,o.useStaticQuery)("3257411868"),l=null===(e=c.site.siteMetadata)||void 0===e?void 0:e.author,i=null===(t=c.site.siteMetadata)||void 0===t?void 0:t.social;return n.createElement("div",{className:"bio"},n.createElement(a.S,{className:"bio-avatar",layout:"fixed",formats:["AUTO","WEBP","AVIF"],src:"../../content/assets/finder.png",width:50,height:50,quality:95,alt:"Profile picture",__imageData:r(4813)}),(null==l?void 0:l.name)&&n.createElement("p",null,"Written by"," ",n.createElement("a",{href:"https://twitter.com/"+((null==i?void 0:i.twitter)||"")},n.createElement("strong",null,l.name))))}},84870:function(e,t,r){"use strict";r.r(t);var n=r(67294),o=r(25444),a=r(46725),c=r(29535),l=r(79534),i=r(93751);t.default=function(e){var t,r=e.data,s=e.location,u=r.mdx,p=(null===(t=r.site.siteMetadata)||void 0===t?void 0:t.title)||"Title",f=r.previous,d=r.next;return n.createElement(l.Z,{location:s,title:p},n.createElement(i.Z,{title:u.frontmatter.title,description:u.frontmatter.description||u.excerpt}),n.createElement("article",{className:"blog-post",itemScope:!0,itemType:"http://schema.org/Article"},n.createElement("header",null,n.createElement("h1",{itemProp:"headline"},u.frontmatter.title),n.createElement("p",null,u.frontmatter.date)),n.createElement(a.MDXRenderer,null,u.body),n.createElement("hr",null),n.createElement("footer",null,n.createElement(c.Z,null))),n.createElement("nav",{className:"blog-post-nav"},n.createElement("ul",{style:{display:"flex",flexWrap:"wrap",justifyContent:"space-between",listStyle:"none",padding:0}},n.createElement("li",null,f&&n.createElement(o.Link,{to:f.fields.slug,rel:"prev"},"← ",f.frontmatter.title)),n.createElement("li",null,d&&n.createElement(o.Link,{to:d.fields.slug,rel:"next"},d.frontmatter.title," →")))))}},4813:function(e){"use strict";e.exports=JSON.parse('{"layout":"fixed","backgroundColor":"#080808","images":{"fallback":{"src":"/static/27d888bc0fcdc0398c33d38334769ba6/e5610/finder.png","srcSet":"/static/27d888bc0fcdc0398c33d38334769ba6/e5610/finder.png 50w,\\n/static/27d888bc0fcdc0398c33d38334769ba6/e9b55/finder.png 100w","sizes":"50px"},"sources":[{"srcSet":"/static/27d888bc0fcdc0398c33d38334769ba6/d4bf4/finder.avif 50w,\\n/static/27d888bc0fcdc0398c33d38334769ba6/ee81f/finder.avif 100w","type":"image/avif","sizes":"50px"},{"srcSet":"/static/27d888bc0fcdc0398c33d38334769ba6/3faea/finder.webp 50w,\\n/static/27d888bc0fcdc0398c33d38334769ba6/6a679/finder.webp 100w","type":"image/webp","sizes":"50px"}]},"width":50,"height":50}')}}]);
//# sourceMappingURL=component---src-templates-blog-post-js-aa1f3f4554deb1545cb9.js.map