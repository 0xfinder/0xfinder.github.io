"use strict";(self.webpackChunkgarden=self.webpackChunkgarden||[]).push([[245],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>m});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},u=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),d=p(r),m=a,h=d["".concat(l,".").concat(m)]||d[m]||c[m]||o;return r?n.createElement(h,s(s({ref:t},u),{},{components:r})):n.createElement(h,s({ref:t},u))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,s=new Array(o);s[0]=d;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:a,s[1]=i;for(var p=2;p<o;p++)s[p]=r[p];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},2240:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>c,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var n=r(7462),a=(r(7294),r(3905));const o={title:"Rust"},s="[Rust](https://www.rust-lang.org/en-US/)",i={unversionedId:"programming-languages/rust/rust",id:"programming-languages/rust/rust",title:"Rust",description:"Notes",source:"@site/docs/programming-languages/rust/rust.md",sourceDirName:"programming-languages/rust",slug:"/programming-languages/rust/",permalink:"/docs/programming-languages/rust/",draft:!1,editUrl:"https://github.com/0xfinder/0xfinder.github.io/docs/programming-languages/rust/rust.md",tags:[],version:"current",frontMatter:{title:"Rust"},sidebar:"tutorialSidebar",previous:{title:"Programming Languages",permalink:"/docs/programming-languages/"},next:{title:"Stuff",permalink:"/docs/stuff/"}},l={},p=[{value:"Notes",id:"notes",level:2},{value:"Concepts",id:"concepts",level:3},{value:"Ownership",id:"ownership",level:4},{value:"Stack",id:"stack",level:4},{value:"Heap",id:"heap",level:4},{value:"Comparison",id:"comparison",level:4},{value:"Links",id:"links",level:2},{value:"More specific stuff",id:"more-specific-stuff",level:2}],u={toc:p};function c(e){let{components:t,...r}=e;return(0,a.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"rust"},(0,a.kt)("a",{parentName:"h1",href:"https://www.rust-lang.org/en-US/"},"Rust")),(0,a.kt)("h2",{id:"notes"},"Notes"),(0,a.kt)("h3",{id:"concepts"},"Concepts"),(0,a.kt)("h4",{id:"ownership"},"Ownership"),(0,a.kt)("p",null,"memory is managed in rust by the concept of ownership - no garbage collectors"),(0,a.kt)("h4",{id:"stack"},"Stack"),(0,a.kt)("p",null,"the stack stores values in the order it gets them and removes the values in the opposite order, last in first out (LIFO)"),(0,a.kt)("p",null,"adding data -> pushing onto the stack\nremoving data -> popping off the stack"),(0,a.kt)("p",null,"data has to have a ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"known")),", ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"fixed"))," size"),(0,a.kt)("h4",{id:"heap"},"Heap"),(0,a.kt)("p",null,"allocating on the heap/putting data on heap: request certain space -> os finds empty spot, marks it as used, returns pointer"),(0,a.kt)("p",null,"pointer is a known fixed size, can be stored on stack, but to access data you have to follow the pointer"),(0,a.kt)("h4",{id:"comparison"},"Comparison"),(0,a.kt)("p",null,"Storing data: Pushing data to the stack is faster than allocating to the heap because the os does not have to search for a place to store the data. "),(0,a.kt)("p",null,"Allocating to the heap req more work as os has to find space & perform bookkeeping"),(0,a.kt)("p",null,"Accessing data: in heap is slower than accessing data on the stack because the os has to follow the pointer to the data."),(0,a.kt)("p",null,"values passed in function parameters are stored on the stack, after function execution, values are popped off the stack"),(0,a.kt)("h2",{id:"links"},"Links"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://doc.rust-lang.org/book/"},"The Book")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://hannydevelop.hashnode.dev/building-defi-with-rust-and-ethereum-providers-and-signers"},"Building DeFi with Rust and Ethereum (Providers and Signers)")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://hannydevelop.hashnode.dev/the-ultimate-guide-to-self-self-in-rust"},"The Ultimate Guide to self, Self in Rust")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://rust-book.cs.brown.edu/ch10-03-lifetime-syntax.html"},"Interactive Rust Book"))),(0,a.kt)("h2",{id:"more-specific-stuff"},"More specific stuff"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://stackoverflow.com/questions/73113438/how-can-i-export-to-store-an-ecdsa-key-pair-in-rust"},"Exporting ECDSA key pair")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://www.kirillvasiltsov.com/writing/optional-arguments-in-rust/"},"Optional arguments in rust"))))}c.isMDXComponent=!0}}]);