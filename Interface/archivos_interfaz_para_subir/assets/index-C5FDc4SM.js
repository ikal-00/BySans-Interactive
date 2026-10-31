var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,o)=>(o=n==null?{}:e(i(n)),s(r||!n||!n.__esModule||!a.call(n,`default`)?t(o,`default`,{value:n,enumerable:!0}):o,n)),l=(e=>typeof require<`u`?require:typeof Proxy<`u`?new Proxy(e,{get:(e,t)=>(typeof require<`u`?require:e)[t]}):e)(function(e){if(typeof require<`u`)return require.apply(this,arguments);throw Error('Calling `require` for "'+e+"\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.")});(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var u=o(((e,t)=>{t.exports={}})),d=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r():typeof define==`function`&&define.amd?define([],r):n.CryptoJS=r()})(e,function(){var e=e||function(e,t){var n;if(typeof window<`u`&&window.crypto&&(n=window.crypto),typeof self<`u`&&self.crypto&&(n=self.crypto),typeof globalThis<`u`&&globalThis.crypto&&(n=globalThis.crypto),!n&&typeof window<`u`&&window.msCrypto&&(n=window.msCrypto),!n&&typeof global<`u`&&global.crypto&&(n=global.crypto),!n&&typeof l==`function`)try{n=u()}catch{}var r=function(){if(n){if(typeof n.getRandomValues==`function`)try{return n.getRandomValues(new Uint32Array(1))[0]}catch{}if(typeof n.randomBytes==`function`)try{return n.randomBytes(4).readInt32LE()}catch{}}throw Error(`Native crypto module could not be used to get secure random number.`)},i=Object.create||function(){function e(){}return function(t){var n;return e.prototype=t,n=new e,e.prototype=null,n}}(),a={},o=a.lib={},s=o.Base=function(){return{extend:function(e){var t=i(this);return e&&t.mixIn(e),(!t.hasOwnProperty(`init`)||this.init===t.init)&&(t.init=function(){t.$super.init.apply(this,arguments)}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty(`toString`)&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),c=o.WordArray=s.extend({init:function(e,n){e=this.words=e||[],this.sigBytes=n==t?e.length*4:n},toString:function(e){return(e||f).stringify(this)},concat:function(e){var t=this.words,n=e.words,r=this.sigBytes,i=e.sigBytes;if(this.clamp(),r%4)for(var a=0;a<i;a++){var o=n[a>>>2]>>>24-a%4*8&255;t[r+a>>>2]|=o<<24-(r+a)%4*8}else for(var s=0;s<i;s+=4)t[r+s>>>2]=n[s>>>2];return this.sigBytes+=i,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=e.ceil(n/4)},clone:function(){var e=s.clone.call(this);return e.words=this.words.slice(0),e},random:function(e){for(var t=[],n=0;n<e;n+=4)t.push(r());return new c.init(t,e)}}),d=a.enc={},f=d.Hex={stringify:function(e){for(var t=e.words,n=e.sigBytes,r=[],i=0;i<n;i++){var a=t[i>>>2]>>>24-i%4*8&255;r.push((a>>>4).toString(16)),r.push((a&15).toString(16))}return r.join(``)},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r+=2)n[r>>>3]|=parseInt(e.substr(r,2),16)<<24-r%8*4;return new c.init(n,t/2)}},p=d.Latin1={stringify:function(e){for(var t=e.words,n=e.sigBytes,r=[],i=0;i<n;i++){var a=t[i>>>2]>>>24-i%4*8&255;r.push(String.fromCharCode(a))}return r.join(``)},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r++)n[r>>>2]|=(e.charCodeAt(r)&255)<<24-r%4*8;return new c.init(n,t)}},m=d.Utf8={stringify:function(e){try{return decodeURIComponent(escape(p.stringify(e)))}catch{throw Error(`Malformed UTF-8 data`)}},parse:function(e){return p.parse(unescape(encodeURIComponent(e)))}},h=o.BufferedBlockAlgorithm=s.extend({reset:function(){this._data=new c.init,this._nDataBytes=0},_append:function(e){typeof e==`string`&&(e=m.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(t){var n,r=this._data,i=r.words,a=r.sigBytes,o=this.blockSize,s=a/(o*4);s=t?e.ceil(s):e.max((s|0)-this._minBufferSize,0);var l=s*o,u=e.min(l*4,a);if(l){for(var d=0;d<l;d+=o)this._doProcessBlock(i,d);n=i.splice(0,l),r.sigBytes-=u}return new c.init(n,u)},clone:function(){var e=s.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});o.Hasher=h.extend({cfg:s.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new g.HMAC.init(e,n).finalize(t)}}});var g=a.algo={};return a}(Math);return e})})),f=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(t){var n=e,r=n.lib,i=r.Base,a=r.WordArray,o=n.x64={};o.Word=i.extend({init:function(e,t){this.high=e,this.low=t}}),o.WordArray=i.extend({init:function(e,n){e=this.words=e||[],this.sigBytes=n==t?e.length*8:n},toX32:function(){for(var e=this.words,t=e.length,n=[],r=0;r<t;r++){var i=e[r];n.push(i.high),n.push(i.low)}return a.create(n,this.sigBytes)},clone:function(){for(var e=i.clone.call(this),t=e.words=this.words.slice(0),n=t.length,r=0;r<n;r++)t[r]=t[r].clone();return e}})})(),e})})),p=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(){if(typeof ArrayBuffer==`function`){var t=e.lib.WordArray,n=t.init,r=t.init=function(e){if(e instanceof ArrayBuffer&&(e=new Uint8Array(e)),(e instanceof Int8Array||typeof Uint8ClampedArray<`u`&&e instanceof Uint8ClampedArray||e instanceof Int16Array||e instanceof Uint16Array||e instanceof Int32Array||e instanceof Uint32Array||e instanceof Float32Array||e instanceof Float64Array)&&(e=new Uint8Array(e.buffer,e.byteOffset,e.byteLength)),e instanceof Uint8Array){for(var t=e.byteLength,r=[],i=0;i<t;i++)r[i>>>2]|=e[i]<<24-i%4*8;n.call(this,r,t)}else n.apply(this,arguments)};r.prototype=t}})(),e.lib.WordArray})})),m=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.WordArray,r=t.enc;r.Utf16=r.Utf16BE={stringify:function(e){for(var t=e.words,n=e.sigBytes,r=[],i=0;i<n;i+=2){var a=t[i>>>2]>>>16-i%4*8&65535;r.push(String.fromCharCode(a))}return r.join(``)},parse:function(e){for(var t=e.length,r=[],i=0;i<t;i++)r[i>>>1]|=e.charCodeAt(i)<<16-i%2*16;return n.create(r,t*2)}},r.Utf16LE={stringify:function(e){for(var t=e.words,n=e.sigBytes,r=[],a=0;a<n;a+=2){var o=i(t[a>>>2]>>>16-a%4*8&65535);r.push(String.fromCharCode(o))}return r.join(``)},parse:function(e){for(var t=e.length,r=[],a=0;a<t;a++)r[a>>>1]|=i(e.charCodeAt(a)<<16-a%2*16);return n.create(r,t*2)}};function i(e){return e<<8&4278255360|e>>>8&16711935}})(),e.enc.Utf16})})),h=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.WordArray,r=t.enc;r.Base64={stringify:function(e){var t=e.words,n=e.sigBytes,r=this._map;e.clamp();for(var i=[],a=0;a<n;a+=3)for(var o=t[a>>>2]>>>24-a%4*8&255,s=t[a+1>>>2]>>>24-(a+1)%4*8&255,c=t[a+2>>>2]>>>24-(a+2)%4*8&255,l=o<<16|s<<8|c,u=0;u<4&&a+u*.75<n;u++)i.push(r.charAt(l>>>6*(3-u)&63));var d=r.charAt(64);if(d)for(;i.length%4;)i.push(d);return i.join(``)},parse:function(e){var t=e.length,n=this._map,r=this._reverseMap;if(!r){r=this._reverseMap=[];for(var a=0;a<n.length;a++)r[n.charCodeAt(a)]=a}var o=n.charAt(64);if(o){var s=e.indexOf(o);s!==-1&&(t=s)}return i(e,t,r)},_map:`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`};function i(e,t,r){for(var i=[],a=0,o=0;o<t;o++)if(o%4){var s=r[e.charCodeAt(o-1)]<<o%4*2|r[e.charCodeAt(o)]>>>6-o%4*2;i[a>>>2]|=s<<24-a%4*8,a++}return n.create(i,a)}})(),e.enc.Base64})})),g=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.WordArray,r=t.enc;r.Base64url={stringify:function(e,t){t===void 0&&(t=!0);var n=e.words,r=e.sigBytes,i=t?this._safe_map:this._map;e.clamp();for(var a=[],o=0;o<r;o+=3)for(var s=n[o>>>2]>>>24-o%4*8&255,c=n[o+1>>>2]>>>24-(o+1)%4*8&255,l=n[o+2>>>2]>>>24-(o+2)%4*8&255,u=s<<16|c<<8|l,d=0;d<4&&o+d*.75<r;d++)a.push(i.charAt(u>>>6*(3-d)&63));var f=i.charAt(64);if(f)for(;a.length%4;)a.push(f);return a.join(``)},parse:function(e,t){t===void 0&&(t=!0);var n=e.length,r=t?this._safe_map:this._map,a=this._reverseMap;if(!a){a=this._reverseMap=[];for(var o=0;o<r.length;o++)a[r.charCodeAt(o)]=o}var s=r.charAt(64);if(s){var c=e.indexOf(s);c!==-1&&(n=c)}return i(e,n,a)},_map:`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`,_safe_map:`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`};function i(e,t,r){for(var i=[],a=0,o=0;o<t;o++)if(o%4){var s=r[e.charCodeAt(o-1)]<<o%4*2|r[e.charCodeAt(o)]>>>6-o%4*2;i[a>>>2]|=s<<24-a%4*8,a++}return n.create(i,a)}})(),e.enc.Base64url})})),_=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(t){var n=e,r=n.lib,i=r.WordArray,a=r.Hasher,o=n.algo,s=[];(function(){for(var e=0;e<64;e++)s[e]=t.abs(t.sin(e+1))*4294967296|0})();var c=o.MD5=a.extend({_doReset:function(){this._hash=new i.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(e,t){for(var n=0;n<16;n++){var r=t+n,i=e[r];e[r]=(i<<8|i>>>24)&16711935|(i<<24|i>>>8)&4278255360}var a=this._hash.words,o=e[t+0],c=e[t+1],p=e[t+2],m=e[t+3],h=e[t+4],g=e[t+5],_=e[t+6],v=e[t+7],y=e[t+8],b=e[t+9],x=e[t+10],S=e[t+11],C=e[t+12],w=e[t+13],T=e[t+14],E=e[t+15],D=a[0],O=a[1],k=a[2],A=a[3];D=l(D,O,k,A,o,7,s[0]),A=l(A,D,O,k,c,12,s[1]),k=l(k,A,D,O,p,17,s[2]),O=l(O,k,A,D,m,22,s[3]),D=l(D,O,k,A,h,7,s[4]),A=l(A,D,O,k,g,12,s[5]),k=l(k,A,D,O,_,17,s[6]),O=l(O,k,A,D,v,22,s[7]),D=l(D,O,k,A,y,7,s[8]),A=l(A,D,O,k,b,12,s[9]),k=l(k,A,D,O,x,17,s[10]),O=l(O,k,A,D,S,22,s[11]),D=l(D,O,k,A,C,7,s[12]),A=l(A,D,O,k,w,12,s[13]),k=l(k,A,D,O,T,17,s[14]),O=l(O,k,A,D,E,22,s[15]),D=u(D,O,k,A,c,5,s[16]),A=u(A,D,O,k,_,9,s[17]),k=u(k,A,D,O,S,14,s[18]),O=u(O,k,A,D,o,20,s[19]),D=u(D,O,k,A,g,5,s[20]),A=u(A,D,O,k,x,9,s[21]),k=u(k,A,D,O,E,14,s[22]),O=u(O,k,A,D,h,20,s[23]),D=u(D,O,k,A,b,5,s[24]),A=u(A,D,O,k,T,9,s[25]),k=u(k,A,D,O,m,14,s[26]),O=u(O,k,A,D,y,20,s[27]),D=u(D,O,k,A,w,5,s[28]),A=u(A,D,O,k,p,9,s[29]),k=u(k,A,D,O,v,14,s[30]),O=u(O,k,A,D,C,20,s[31]),D=d(D,O,k,A,g,4,s[32]),A=d(A,D,O,k,y,11,s[33]),k=d(k,A,D,O,S,16,s[34]),O=d(O,k,A,D,T,23,s[35]),D=d(D,O,k,A,c,4,s[36]),A=d(A,D,O,k,h,11,s[37]),k=d(k,A,D,O,v,16,s[38]),O=d(O,k,A,D,x,23,s[39]),D=d(D,O,k,A,w,4,s[40]),A=d(A,D,O,k,o,11,s[41]),k=d(k,A,D,O,m,16,s[42]),O=d(O,k,A,D,_,23,s[43]),D=d(D,O,k,A,b,4,s[44]),A=d(A,D,O,k,C,11,s[45]),k=d(k,A,D,O,E,16,s[46]),O=d(O,k,A,D,p,23,s[47]),D=f(D,O,k,A,o,6,s[48]),A=f(A,D,O,k,v,10,s[49]),k=f(k,A,D,O,T,15,s[50]),O=f(O,k,A,D,g,21,s[51]),D=f(D,O,k,A,C,6,s[52]),A=f(A,D,O,k,m,10,s[53]),k=f(k,A,D,O,x,15,s[54]),O=f(O,k,A,D,c,21,s[55]),D=f(D,O,k,A,y,6,s[56]),A=f(A,D,O,k,E,10,s[57]),k=f(k,A,D,O,_,15,s[58]),O=f(O,k,A,D,w,21,s[59]),D=f(D,O,k,A,h,6,s[60]),A=f(A,D,O,k,S,10,s[61]),k=f(k,A,D,O,p,15,s[62]),O=f(O,k,A,D,b,21,s[63]),a[0]=a[0]+D|0,a[1]=a[1]+O|0,a[2]=a[2]+k|0,a[3]=a[3]+A|0},_doFinalize:function(){var e=this._data,n=e.words,r=this._nDataBytes*8,i=e.sigBytes*8;n[i>>>5]|=128<<24-i%32;var a=t.floor(r/4294967296),o=r;n[(i+64>>>9<<4)+15]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360,n[(i+64>>>9<<4)+14]=(o<<8|o>>>24)&16711935|(o<<24|o>>>8)&4278255360,e.sigBytes=(n.length+1)*4,this._process();for(var s=this._hash,c=s.words,l=0;l<4;l++){var u=c[l];c[l]=(u<<8|u>>>24)&16711935|(u<<24|u>>>8)&4278255360}return s},clone:function(){var e=a.clone.call(this);return e._hash=this._hash.clone(),e}});function l(e,t,n,r,i,a,o){var s=e+(t&n|~t&r)+i+o;return(s<<a|s>>>32-a)+t}function u(e,t,n,r,i,a,o){var s=e+(t&r|n&~r)+i+o;return(s<<a|s>>>32-a)+t}function d(e,t,n,r,i,a,o){var s=e+(t^n^r)+i+o;return(s<<a|s>>>32-a)+t}function f(e,t,n,r,i,a,o){var s=e+(n^(t|~r))+i+o;return(s<<a|s>>>32-a)+t}n.MD5=a._createHelper(c),n.HmacMD5=a._createHmacHelper(c)})(Math),e.MD5})})),v=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib,r=n.WordArray,i=n.Hasher,a=t.algo,o=[],s=a.SHA1=i.extend({_doReset:function(){this._hash=new r.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],a=n[2],s=n[3],c=n[4],l=0;l<80;l++){if(l<16)o[l]=e[t+l]|0;else{var u=o[l-3]^o[l-8]^o[l-14]^o[l-16];o[l]=u<<1|u>>>31}var d=(r<<5|r>>>27)+c+o[l];d+=l<20?(i&a|~i&s)+1518500249:l<40?(i^a^s)+1859775393:l<60?(i&a|i&s|a&s)-1894007588:(i^a^s)-899497514,c=s,s=a,a=i<<30|i>>>2,i=r,r=d}n[0]=n[0]+r|0,n[1]=n[1]+i|0,n[2]=n[2]+a|0,n[3]=n[3]+s|0,n[4]=n[4]+c|0},_doFinalize:function(){var e=this._data,t=e.words,n=this._nDataBytes*8,r=e.sigBytes*8;return t[r>>>5]|=128<<24-r%32,t[(r+64>>>9<<4)+14]=Math.floor(n/4294967296),t[(r+64>>>9<<4)+15]=n,e.sigBytes=t.length*4,this._process(),this._hash},clone:function(){var e=i.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA1=i._createHelper(s),t.HmacSHA1=i._createHmacHelper(s)})(),e.SHA1})})),y=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(t){var n=e,r=n.lib,i=r.WordArray,a=r.Hasher,o=n.algo,s=[],c=[];(function(){function e(e){for(var n=t.sqrt(e),r=2;r<=n;r++)if(!(e%r))return!1;return!0}function n(e){return(e-(e|0))*4294967296|0}for(var r=2,i=0;i<64;)e(r)&&(i<8&&(s[i]=n(t.pow(r,1/2))),c[i]=n(t.pow(r,1/3)),i++),r++})();var l=[],u=o.SHA256=a.extend({_doReset:function(){this._hash=new i.init(s.slice(0))},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],a=n[2],o=n[3],s=n[4],u=n[5],d=n[6],f=n[7],p=0;p<64;p++){if(p<16)l[p]=e[t+p]|0;else{var m=l[p-15],h=(m<<25|m>>>7)^(m<<14|m>>>18)^m>>>3,g=l[p-2],_=(g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10;l[p]=h+l[p-7]+_+l[p-16]}var v=s&u^~s&d,y=r&i^r&a^i&a,b=(r<<30|r>>>2)^(r<<19|r>>>13)^(r<<10|r>>>22),x=(s<<26|s>>>6)^(s<<21|s>>>11)^(s<<7|s>>>25),S=f+x+v+c[p]+l[p],C=b+y;f=d,d=u,u=s,s=o+S|0,o=a,a=i,i=r,r=S+C|0}n[0]=n[0]+r|0,n[1]=n[1]+i|0,n[2]=n[2]+a|0,n[3]=n[3]+o|0,n[4]=n[4]+s|0,n[5]=n[5]+u|0,n[6]=n[6]+d|0,n[7]=n[7]+f|0},_doFinalize:function(){var e=this._data,n=e.words,r=this._nDataBytes*8,i=e.sigBytes*8;return n[i>>>5]|=128<<24-i%32,n[(i+64>>>9<<4)+14]=t.floor(r/4294967296),n[(i+64>>>9<<4)+15]=r,e.sigBytes=n.length*4,this._process(),this._hash},clone:function(){var e=a.clone.call(this);return e._hash=this._hash.clone(),e}});n.SHA256=a._createHelper(u),n.HmacSHA256=a._createHmacHelper(u)})(Math),e.SHA256})})),b=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),y()):typeof define==`function`&&define.amd?define([`./core`,`./sha256`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.WordArray,r=t.algo,i=r.SHA256,a=r.SHA224=i.extend({_doReset:function(){this._hash=new n.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var e=i._doFinalize.call(this);return e.sigBytes-=4,e}});t.SHA224=i._createHelper(a),t.HmacSHA224=i._createHmacHelper(a)})(),e.SHA224})})),x=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),f()):typeof define==`function`&&define.amd?define([`./core`,`./x64-core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.Hasher,r=t.x64,i=r.Word,a=r.WordArray,o=t.algo;function s(){return i.create.apply(i,arguments)}var c=[s(1116352408,3609767458),s(1899447441,602891725),s(3049323471,3964484399),s(3921009573,2173295548),s(961987163,4081628472),s(1508970993,3053834265),s(2453635748,2937671579),s(2870763221,3664609560),s(3624381080,2734883394),s(310598401,1164996542),s(607225278,1323610764),s(1426881987,3590304994),s(1925078388,4068182383),s(2162078206,991336113),s(2614888103,633803317),s(3248222580,3479774868),s(3835390401,2666613458),s(4022224774,944711139),s(264347078,2341262773),s(604807628,2007800933),s(770255983,1495990901),s(1249150122,1856431235),s(1555081692,3175218132),s(1996064986,2198950837),s(2554220882,3999719339),s(2821834349,766784016),s(2952996808,2566594879),s(3210313671,3203337956),s(3336571891,1034457026),s(3584528711,2466948901),s(113926993,3758326383),s(338241895,168717936),s(666307205,1188179964),s(773529912,1546045734),s(1294757372,1522805485),s(1396182291,2643833823),s(1695183700,2343527390),s(1986661051,1014477480),s(2177026350,1206759142),s(2456956037,344077627),s(2730485921,1290863460),s(2820302411,3158454273),s(3259730800,3505952657),s(3345764771,106217008),s(3516065817,3606008344),s(3600352804,1432725776),s(4094571909,1467031594),s(275423344,851169720),s(430227734,3100823752),s(506948616,1363258195),s(659060556,3750685593),s(883997877,3785050280),s(958139571,3318307427),s(1322822218,3812723403),s(1537002063,2003034995),s(1747873779,3602036899),s(1955562222,1575990012),s(2024104815,1125592928),s(2227730452,2716904306),s(2361852424,442776044),s(2428436474,593698344),s(2756734187,3733110249),s(3204031479,2999351573),s(3329325298,3815920427),s(3391569614,3928383900),s(3515267271,566280711),s(3940187606,3454069534),s(4118630271,4000239992),s(116418474,1914138554),s(174292421,2731055270),s(289380356,3203993006),s(460393269,320620315),s(685471733,587496836),s(852142971,1086792851),s(1017036298,365543100),s(1126000580,2618297676),s(1288033470,3409855158),s(1501505948,4234509866),s(1607167915,987167468),s(1816402316,1246189591)],l=[];(function(){for(var e=0;e<80;e++)l[e]=s()})();var u=o.SHA512=n.extend({_doReset:function(){this._hash=new a.init([new i.init(1779033703,4089235720),new i.init(3144134277,2227873595),new i.init(1013904242,4271175723),new i.init(2773480762,1595750129),new i.init(1359893119,2917565137),new i.init(2600822924,725511199),new i.init(528734635,4215389547),new i.init(1541459225,327033209)])},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],a=n[2],o=n[3],s=n[4],u=n[5],d=n[6],f=n[7],p=r.high,m=r.low,h=i.high,g=i.low,_=a.high,v=a.low,y=o.high,b=o.low,x=s.high,S=s.low,C=u.high,w=u.low,T=d.high,E=d.low,D=f.high,O=f.low,k=p,A=m,j=h,M=g,N=_,P=v,F=y,I=b,L=x,ee=S,te=C,ne=w,R=T,re=E,z=D,ie=O,ae=0;ae<80;ae++){var oe,B,se=l[ae];if(ae<16)B=se.high=e[t+ae*2]|0,oe=se.low=e[t+ae*2+1]|0;else{var ce=l[ae-15],le=ce.high,ue=ce.low,de=(le>>>1|ue<<31)^(le>>>8|ue<<24)^le>>>7,fe=(ue>>>1|le<<31)^(ue>>>8|le<<24)^(ue>>>7|le<<25),pe=l[ae-2],me=pe.high,he=pe.low,ge=(me>>>19|he<<13)^(me<<3|he>>>29)^me>>>6,V=(he>>>19|me<<13)^(he<<3|me>>>29)^(he>>>6|me<<26),_e=l[ae-7],ve=_e.high,ye=_e.low,H=l[ae-16],U=H.high,W=H.low;oe=fe+ye,B=de+ve+ +(oe>>>0<fe>>>0),oe+=V,B=B+ge+ +(oe>>>0<V>>>0),oe+=W,B=B+U+ +(oe>>>0<W>>>0),se.high=B,se.low=oe}var G=L&te^~L&R,be=ee&ne^~ee&re,xe=k&j^k&N^j&N,Se=A&M^A&P^M&P,Ce=(k>>>28|A<<4)^(k<<30|A>>>2)^(k<<25|A>>>7),we=(A>>>28|k<<4)^(A<<30|k>>>2)^(A<<25|k>>>7),Te=(L>>>14|ee<<18)^(L>>>18|ee<<14)^(L<<23|ee>>>9),Ee=(ee>>>14|L<<18)^(ee>>>18|L<<14)^(ee<<23|L>>>9),De=c[ae],Oe=De.high,ke=De.low,Ae=ie+Ee,je=z+Te+ +(Ae>>>0<ie>>>0),Ae=Ae+be,je=je+G+ +(Ae>>>0<be>>>0),Ae=Ae+ke,je=je+Oe+ +(Ae>>>0<ke>>>0),Ae=Ae+oe,je=je+B+ +(Ae>>>0<oe>>>0),Me=we+Se,Ne=Ce+xe+ +(Me>>>0<we>>>0);z=R,ie=re,R=te,re=ne,te=L,ne=ee,ee=I+Ae|0,L=F+je+ +(ee>>>0<I>>>0)|0,F=N,I=P,N=j,P=M,j=k,M=A,A=Ae+Me|0,k=je+Ne+ +(A>>>0<Ae>>>0)|0}m=r.low=m+A,r.high=p+k+ +(m>>>0<A>>>0),g=i.low=g+M,i.high=h+j+ +(g>>>0<M>>>0),v=a.low=v+P,a.high=_+N+ +(v>>>0<P>>>0),b=o.low=b+I,o.high=y+F+ +(b>>>0<I>>>0),S=s.low=S+ee,s.high=x+L+ +(S>>>0<ee>>>0),w=u.low=w+ne,u.high=C+te+ +(w>>>0<ne>>>0),E=d.low=E+re,d.high=T+R+ +(E>>>0<re>>>0),O=f.low=O+ie,f.high=D+z+ +(O>>>0<ie>>>0)},_doFinalize:function(){var e=this._data,t=e.words,n=this._nDataBytes*8,r=e.sigBytes*8;return t[r>>>5]|=128<<24-r%32,t[(r+128>>>10<<5)+30]=Math.floor(n/4294967296),t[(r+128>>>10<<5)+31]=n,e.sigBytes=t.length*4,this._process(),this._hash.toX32()},clone:function(){var e=n.clone.call(this);return e._hash=this._hash.clone(),e},blockSize:32});t.SHA512=n._createHelper(u),t.HmacSHA512=n._createHmacHelper(u)})(),e.SHA512})})),S=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),f(),x()):typeof define==`function`&&define.amd?define([`./core`,`./x64-core`,`./sha512`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.x64,r=n.Word,i=n.WordArray,a=t.algo,o=a.SHA512,s=a.SHA384=o.extend({_doReset:function(){this._hash=new i.init([new r.init(3418070365,3238371032),new r.init(1654270250,914150663),new r.init(2438529370,812702999),new r.init(355462360,4144912697),new r.init(1731405415,4290775857),new r.init(2394180231,1750603025),new r.init(3675008525,1694076839),new r.init(1203062813,3204075428)])},_doFinalize:function(){var e=o._doFinalize.call(this);return e.sigBytes-=16,e}});t.SHA384=o._createHelper(s),t.HmacSHA384=o._createHmacHelper(s)})(),e.SHA384})})),C=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),f()):typeof define==`function`&&define.amd?define([`./core`,`./x64-core`],r):r(n.CryptoJS)})(e,function(e){return(function(t){var n=e,r=n.lib,i=r.WordArray,a=r.Hasher,o=n.x64.Word,s=n.algo,c=[],l=[],u=[];(function(){for(var e=1,t=0,n=0;n<24;n++){c[e+5*t]=(n+1)*(n+2)/2%64;var r=t%5,i=(2*e+3*t)%5;e=r,t=i}for(var e=0;e<5;e++)for(var t=0;t<5;t++)l[e+5*t]=t+(2*e+3*t)%5*5;for(var a=1,s=0;s<24;s++){for(var d=0,f=0,p=0;p<7;p++){if(a&1){var m=(1<<p)-1;m<32?f^=1<<m:d^=1<<m-32}a&128?a=a<<1^113:a<<=1}u[s]=o.create(d,f)}})();var d=[];(function(){for(var e=0;e<25;e++)d[e]=o.create()})();var f=s.SHA3=a.extend({cfg:a.cfg.extend({outputLength:512}),_doReset:function(){for(var e=this._state=[],t=0;t<25;t++)e[t]=new o.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(e,t){for(var n=this._state,r=this.blockSize/2,i=0;i<r;i++){var a=e[t+2*i],o=e[t+2*i+1];a=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360,o=(o<<8|o>>>24)&16711935|(o<<24|o>>>8)&4278255360;var s=n[i];s.high^=o,s.low^=a}for(var f=0;f<24;f++){for(var p=0;p<5;p++){for(var m=0,h=0,g=0;g<5;g++){var s=n[p+5*g];m^=s.high,h^=s.low}var _=d[p];_.high=m,_.low=h}for(var p=0;p<5;p++)for(var v=d[(p+4)%5],y=d[(p+1)%5],b=y.high,x=y.low,m=v.high^(b<<1|x>>>31),h=v.low^(x<<1|b>>>31),g=0;g<5;g++){var s=n[p+5*g];s.high^=m,s.low^=h}for(var S=1;S<25;S++){var m,h,s=n[S],C=s.high,w=s.low,T=c[S];T<32?(m=C<<T|w>>>32-T,h=w<<T|C>>>32-T):(m=w<<T-32|C>>>64-T,h=C<<T-32|w>>>64-T);var E=d[l[S]];E.high=m,E.low=h}var D=d[0],O=n[0];D.high=O.high,D.low=O.low;for(var p=0;p<5;p++)for(var g=0;g<5;g++){var S=p+5*g,s=n[S],k=d[S],A=d[(p+1)%5+5*g],j=d[(p+2)%5+5*g];s.high=k.high^~A.high&j.high,s.low=k.low^~A.low&j.low}var s=n[0],M=u[f];s.high^=M.high,s.low^=M.low}},_doFinalize:function(){var e=this._data,n=e.words;this._nDataBytes*8;var r=e.sigBytes*8,a=this.blockSize*32;n[r>>>5]|=1<<24-r%32,n[(t.ceil((r+1)/a)*a>>>5)-1]|=128,e.sigBytes=n.length*4,this._process();for(var o=this._state,s=this.cfg.outputLength/8,c=s/8,l=[],u=0;u<c;u++){var d=o[u],f=d.high,p=d.low;f=(f<<8|f>>>24)&16711935|(f<<24|f>>>8)&4278255360,p=(p<<8|p>>>24)&16711935|(p<<24|p>>>8)&4278255360,l.push(p),l.push(f)}return new i.init(l,s)},clone:function(){for(var e=a.clone.call(this),t=e._state=this._state.slice(0),n=0;n<25;n++)t[n]=t[n].clone();return e}});n.SHA3=a._createHelper(f),n.HmacSHA3=a._createHmacHelper(f)})(Math),e.SHA3})})),w=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){return(function(t){var n=e,r=n.lib,i=r.WordArray,a=r.Hasher,o=n.algo,s=i.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),c=i.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),l=i.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),u=i.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),d=i.create([0,1518500249,1859775393,2400959708,2840853838]),f=i.create([1352829926,1548603684,1836072691,2053994217,0]),p=o.RIPEMD160=a.extend({_doReset:function(){this._hash=i.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(e,t){for(var n=0;n<16;n++){var r=t+n,i=e[r];e[r]=(i<<8|i>>>24)&16711935|(i<<24|i>>>8)&4278255360}for(var a=this._hash.words,o=d.words,p=f.words,b=s.words,x=c.words,S=l.words,C=u.words,w,T,E,D,O,k=w=a[0],A=T=a[1],j=E=a[2],M=D=a[3],N=O=a[4],P,n=0;n<80;n+=1)P=w+e[t+b[n]]|0,P+=n<16?m(T,E,D)+o[0]:n<32?h(T,E,D)+o[1]:n<48?g(T,E,D)+o[2]:n<64?_(T,E,D)+o[3]:v(T,E,D)+o[4],P|=0,P=y(P,S[n]),P=P+O|0,w=O,O=D,D=y(E,10),E=T,T=P,P=k+e[t+x[n]]|0,P+=n<16?v(A,j,M)+p[0]:n<32?_(A,j,M)+p[1]:n<48?g(A,j,M)+p[2]:n<64?h(A,j,M)+p[3]:m(A,j,M)+p[4],P|=0,P=y(P,C[n]),P=P+N|0,k=N,N=M,M=y(j,10),j=A,A=P;P=a[1]+E+M|0,a[1]=a[2]+D+N|0,a[2]=a[3]+O+k|0,a[3]=a[4]+w+A|0,a[4]=a[0]+T+j|0,a[0]=P},_doFinalize:function(){var e=this._data,t=e.words,n=this._nDataBytes*8,r=e.sigBytes*8;t[r>>>5]|=128<<24-r%32,t[(r+64>>>9<<4)+14]=(n<<8|n>>>24)&16711935|(n<<24|n>>>8)&4278255360,e.sigBytes=(t.length+1)*4,this._process();for(var i=this._hash,a=i.words,o=0;o<5;o++){var s=a[o];a[o]=(s<<8|s>>>24)&16711935|(s<<24|s>>>8)&4278255360}return i},clone:function(){var e=a.clone.call(this);return e._hash=this._hash.clone(),e}});function m(e,t,n){return e^t^n}function h(e,t,n){return e&t|~e&n}function g(e,t,n){return(e|~t)^n}function _(e,t,n){return e&n|t&~n}function v(e,t,n){return e^(t|~n)}function y(e,t){return e<<t|e>>>32-t}n.RIPEMD160=a._createHelper(p),n.HmacRIPEMD160=a._createHmacHelper(p)})(Math),e.RIPEMD160})})),T=o(((e,t)=>{(function(n,r){typeof e==`object`?t.exports=e=r(d()):typeof define==`function`&&define.amd?define([`./core`],r):r(n.CryptoJS)})(e,function(e){(function(){var t=e,n=t.lib.Base,r=t.enc.Utf8,i=t.algo;i.HMAC=n.extend({init:function(e,t){e=this._hasher=new e.init,typeof t==`string`&&(t=r.parse(t));var n=e.blockSize,i=n*4;t.sigBytes>i&&(t=e.finalize(t)),t.clamp();for(var a=this._oKey=t.clone(),o=this._iKey=t.clone(),s=a.words,c=o.words,l=0;l<n;l++)s[l]^=1549556828,c[l]^=909522486;a.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var t=this._hasher,n=t.finalize(e);return t.reset(),t.finalize(this._oKey.clone().concat(n))}})})()})})),E=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),y(),T()):typeof define==`function`&&define.amd?define([`./core`,`./sha256`,`./hmac`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib,r=n.Base,i=n.WordArray,a=t.algo,o=a.SHA256,s=a.HMAC,c=a.PBKDF2=r.extend({cfg:r.extend({keySize:4,hasher:o,iterations:25e4}),init:function(e){this.cfg=this.cfg.extend(e)},compute:function(e,t){for(var n=this.cfg,r=s.create(n.hasher,e),a=i.create(),o=i.create([1]),c=a.words,l=o.words,u=n.keySize,d=n.iterations;c.length<u;){var f=r.update(t).finalize(o);r.reset();for(var p=f.words,m=p.length,h=f,g=1;g<d;g++){h=r.finalize(h),r.reset();for(var _=h.words,v=0;v<m;v++)p[v]^=_[v]}a.concat(f),l[0]++}return a.sigBytes=u*4,a}});t.PBKDF2=function(e,t,n){return c.create(n).compute(e,t)}})(),e.PBKDF2})})),D=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),v(),T()):typeof define==`function`&&define.amd?define([`./core`,`./sha1`,`./hmac`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib,r=n.Base,i=n.WordArray,a=t.algo,o=a.MD5,s=a.EvpKDF=r.extend({cfg:r.extend({keySize:4,hasher:o,iterations:1}),init:function(e){this.cfg=this.cfg.extend(e)},compute:function(e,t){for(var n,r=this.cfg,a=r.hasher.create(),o=i.create(),s=o.words,c=r.keySize,l=r.iterations;s.length<c;){n&&a.update(n),n=a.update(e).finalize(t),a.reset();for(var u=1;u<l;u++)n=a.finalize(n),a.reset();o.concat(n)}return o.sigBytes=c*4,o}});t.EvpKDF=function(e,t,n){return s.create(n).compute(e,t)}})(),e.EvpKDF})})),O=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),D()):typeof define==`function`&&define.amd?define([`./core`,`./evpkdf`],r):r(n.CryptoJS)})(e,function(e){e.lib.Cipher||function(t){var n=e,r=n.lib,i=r.Base,a=r.WordArray,o=r.BufferedBlockAlgorithm,s=n.enc;s.Utf8;var c=s.Base64,l=n.algo.EvpKDF,u=r.Cipher=o.extend({cfg:i.extend(),createEncryptor:function(e,t){return this.create(this._ENC_XFORM_MODE,e,t)},createDecryptor:function(e,t){return this.create(this._DEC_XFORM_MODE,e,t)},init:function(e,t,n){this.cfg=this.cfg.extend(n),this._xformMode=e,this._key=t,this.reset()},reset:function(){o.reset.call(this),this._doReset()},process:function(e){return this._append(e),this._process()},finalize:function(e){return e&&this._append(e),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(){function e(e){return typeof e==`string`?S:y}return function(t){return{encrypt:function(n,r,i){return e(r).encrypt(t,n,r,i)},decrypt:function(n,r,i){return e(r).decrypt(t,n,r,i)}}}}()});r.StreamCipher=u.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var d=n.mode={},f=r.BlockCipherMode=i.extend({createEncryptor:function(e,t){return this.Encryptor.create(e,t)},createDecryptor:function(e,t){return this.Decryptor.create(e,t)},init:function(e,t){this._cipher=e,this._iv=t}}),p=d.CBC=function(){var e=f.extend();e.Encryptor=e.extend({processBlock:function(e,t){var r=this._cipher,i=r.blockSize;n.call(this,e,t,i),r.encryptBlock(e,t),this._prevBlock=e.slice(t,t+i)}}),e.Decryptor=e.extend({processBlock:function(e,t){var r=this._cipher,i=r.blockSize,a=e.slice(t,t+i);r.decryptBlock(e,t),n.call(this,e,t,i),this._prevBlock=a}});function n(e,n,r){var i,a=this._iv;a?(i=a,this._iv=t):i=this._prevBlock;for(var o=0;o<r;o++)e[n+o]^=i[o]}return e}(),m=n.pad={},h=m.Pkcs7={pad:function(e,t){for(var n=t*4,r=n-e.sigBytes%n,i=r<<24|r<<16|r<<8|r,o=[],s=0;s<r;s+=4)o.push(i);var c=a.create(o,r);e.concat(c)},unpad:function(e){var t=e.words[e.sigBytes-1>>>2]&255;e.sigBytes-=t}};r.BlockCipher=u.extend({cfg:u.cfg.extend({mode:p,padding:h}),reset:function(){var e;u.reset.call(this);var t=this.cfg,n=t.iv,r=t.mode;this._xformMode==this._ENC_XFORM_MODE?e=r.createEncryptor:(e=r.createDecryptor,this._minBufferSize=1),this._mode&&this._mode.__creator==e?this._mode.init(this,n&&n.words):(this._mode=e.call(r,this,n&&n.words),this._mode.__creator=e)},_doProcessBlock:function(e,t){this._mode.processBlock(e,t)},_doFinalize:function(){var e,t=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(t.pad(this._data,this.blockSize),e=this._process(!0)):(e=this._process(!0),t.unpad(e)),e},blockSize:4});var g=r.CipherParams=i.extend({init:function(e){this.mixIn(e)},toString:function(e){return(e||this.formatter).stringify(this)}}),_=n.format={},v=_.OpenSSL={stringify:function(e){var t,n=e.ciphertext,r=e.salt;return t=r?a.create([1398893684,1701076831]).concat(r).concat(n):n,t.toString(c)},parse:function(e){var t,n=c.parse(e),r=n.words;return r[0]==1398893684&&r[1]==1701076831&&(t=a.create(r.slice(2,4)),r.splice(0,4),n.sigBytes-=16),g.create({ciphertext:n,salt:t})}},y=r.SerializableCipher=i.extend({cfg:i.extend({format:v}),encrypt:function(e,t,n,r){r=this.cfg.extend(r);var i=e.createEncryptor(n,r),a=i.finalize(t),o=i.cfg;return g.create({ciphertext:a,key:n,iv:o.iv,algorithm:e,mode:o.mode,padding:o.padding,blockSize:e.blockSize,formatter:r.format})},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),e.createDecryptor(n,r).finalize(t.ciphertext)},_parse:function(e,t){return typeof e==`string`?t.parse(e,this):e}}),b=n.kdf={},x=b.OpenSSL={execute:function(e,t,n,r,i){if(r||=a.random(8),i)var o=l.create({keySize:t+n,hasher:i}).compute(e,r);else var o=l.create({keySize:t+n}).compute(e,r);var s=a.create(o.words.slice(t),n*4);return o.sigBytes=t*4,g.create({key:o,iv:s,salt:r})}},S=r.PasswordBasedCipher=y.extend({cfg:y.cfg.extend({kdf:x}),encrypt:function(e,t,n,r){r=this.cfg.extend(r);var i=r.kdf.execute(n,e.keySize,e.ivSize,r.salt,r.hasher);r.iv=i.iv;var a=y.encrypt.call(this,e,t,i.key,r);return a.mixIn(i),a},decrypt:function(e,t,n,r){r=this.cfg.extend(r),t=this._parse(t,r.format);var i=r.kdf.execute(n,e.keySize,e.ivSize,t.salt,r.hasher);return r.iv=i.iv,y.decrypt.call(this,e,t,i.key,r)}})}()})})),k=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.mode.CFB=function(){var t=e.lib.BlockCipherMode.extend();t.Encryptor=t.extend({processBlock:function(e,t){var r=this._cipher,i=r.blockSize;n.call(this,e,t,i,r),this._prevBlock=e.slice(t,t+i)}}),t.Decryptor=t.extend({processBlock:function(e,t){var r=this._cipher,i=r.blockSize,a=e.slice(t,t+i);n.call(this,e,t,i,r),this._prevBlock=a}});function n(e,t,n,r){var i,a=this._iv;a?(i=a.slice(0),this._iv=void 0):i=this._prevBlock,r.encryptBlock(i,0);for(var o=0;o<n;o++)e[t+o]^=i[o]}return t}(),e.mode.CFB})})),A=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.mode.CTR=function(){var t=e.lib.BlockCipherMode.extend();return t.Decryptor=t.Encryptor=t.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize,i=this._iv,a=this._counter;i&&(a=this._counter=i.slice(0),this._iv=void 0);var o=a.slice(0);n.encryptBlock(o,0),a[r-1]=a[r-1]+1|0;for(var s=0;s<r;s++)e[t+s]^=o[s]}}),t}(),e.mode.CTR})})),j=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.mode.CTRGladman=function(){var t=e.lib.BlockCipherMode.extend();function n(e){if((e>>24&255)==255){var t=e>>16&255,n=e>>8&255,r=e&255;t===255?(t=0,n===255?(n=0,r===255?r=0:++r):++n):++t,e=0,e+=t<<16,e+=n<<8,e+=r}else e+=1<<24;return e}function r(e){return(e[0]=n(e[0]))===0&&(e[1]=n(e[1])),e}return t.Decryptor=t.Encryptor=t.extend({processBlock:function(e,t){var n=this._cipher,i=n.blockSize,a=this._iv,o=this._counter;a&&(o=this._counter=a.slice(0),this._iv=void 0),r(o);var s=o.slice(0);n.encryptBlock(s,0);for(var c=0;c<i;c++)e[t+c]^=s[c]}}),t}(),e.mode.CTRGladman})})),M=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.mode.OFB=function(){var t=e.lib.BlockCipherMode.extend();return t.Decryptor=t.Encryptor=t.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize,i=this._iv,a=this._keystream;i&&(a=this._keystream=i.slice(0),this._iv=void 0),n.encryptBlock(a,0);for(var o=0;o<r;o++)e[t+o]^=a[o]}}),t}(),e.mode.OFB})})),N=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.mode.ECB=function(){var t=e.lib.BlockCipherMode.extend();return t.Encryptor=t.extend({processBlock:function(e,t){this._cipher.encryptBlock(e,t)}}),t.Decryptor=t.extend({processBlock:function(e,t){this._cipher.decryptBlock(e,t)}}),t}(),e.mode.ECB})})),P=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.pad.AnsiX923={pad:function(e,t){var n=e.sigBytes,r=t*4,i=r-n%r,a=n+i-1;e.clamp(),e.words[a>>>2]|=i<<24-a%4*8,e.sigBytes+=i},unpad:function(e){var t=e.words[e.sigBytes-1>>>2]&255;e.sigBytes-=t}},e.pad.Ansix923})})),F=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.pad.Iso10126={pad:function(t,n){var r=n*4,i=r-t.sigBytes%r;t.concat(e.lib.WordArray.random(i-1)).concat(e.lib.WordArray.create([i<<24],1))},unpad:function(e){var t=e.words[e.sigBytes-1>>>2]&255;e.sigBytes-=t}},e.pad.Iso10126})})),I=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.pad.Iso97971={pad:function(t,n){t.concat(e.lib.WordArray.create([2147483648],1)),e.pad.ZeroPadding.pad(t,n)},unpad:function(t){e.pad.ZeroPadding.unpad(t),t.sigBytes--}},e.pad.Iso97971})})),L=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.pad.ZeroPadding={pad:function(e,t){var n=t*4;e.clamp(),e.sigBytes+=n-(e.sigBytes%n||n)},unpad:function(e){for(var t=e.words,n=e.sigBytes-1,n=e.sigBytes-1;n>=0;n--)if(t[n>>>2]>>>24-n%4*8&255){e.sigBytes=n+1;break}}},e.pad.ZeroPadding})})),ee=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return e.pad.NoPadding={pad:function(){},unpad:function(){}},e.pad.NoPadding})})),te=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),O()):typeof define==`function`&&define.amd?define([`./core`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return(function(t){var n=e,r=n.lib.CipherParams,i=n.enc.Hex,a=n.format;a.Hex={stringify:function(e){return e.ciphertext.toString(i)},parse:function(e){var t=i.parse(e);return r.create({ciphertext:t})}}})(),e.format.Hex})})),ne=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),h(),_(),D(),O()):typeof define==`function`&&define.amd?define([`./core`,`./enc-base64`,`./md5`,`./evpkdf`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.BlockCipher,r=t.algo,i=[],a=[],o=[],s=[],c=[],l=[],u=[],d=[],f=[],p=[];(function(){for(var e=[],t=0;t<256;t++)t<128?e[t]=t<<1:e[t]=t<<1^283;for(var n=0,r=0,t=0;t<256;t++){var m=r^r<<1^r<<2^r<<3^r<<4;m=m>>>8^m&255^99,i[n]=m,a[m]=n;var h=e[n],g=e[h],_=e[g],v=e[m]*257^m*16843008;o[n]=v<<24|v>>>8,s[n]=v<<16|v>>>16,c[n]=v<<8|v>>>24,l[n]=v;var v=_*16843009^g*65537^h*257^n*16843008;u[m]=v<<24|v>>>8,d[m]=v<<16|v>>>16,f[m]=v<<8|v>>>24,p[m]=v,n?(n=h^e[e[e[_^h]]],r^=e[e[r]]):n=r=1}})();var m=[0,1,2,4,8,16,32,64,128,27,54],h=r.AES=n.extend({_doReset:function(){var e;if(!(this._nRounds&&this._keyPriorReset===this._key)){for(var t=this._keyPriorReset=this._key,n=t.words,r=t.sigBytes/4,a=((this._nRounds=r+6)+1)*4,o=this._keySchedule=[],s=0;s<a;s++)s<r?o[s]=n[s]:(e=o[s-1],s%r?r>6&&s%r==4&&(e=i[e>>>24]<<24|i[e>>>16&255]<<16|i[e>>>8&255]<<8|i[e&255]):(e=e<<8|e>>>24,e=i[e>>>24]<<24|i[e>>>16&255]<<16|i[e>>>8&255]<<8|i[e&255],e^=m[s/r|0]<<24),o[s]=o[s-r]^e);for(var c=this._invKeySchedule=[],l=0;l<a;l++){var s=a-l;if(l%4)var e=o[s];else var e=o[s-4];l<4||s<=4?c[l]=e:c[l]=u[i[e>>>24]]^d[i[e>>>16&255]]^f[i[e>>>8&255]]^p[i[e&255]]}}},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._keySchedule,o,s,c,l,i)},decryptBlock:function(e,t){var n=e[t+1];e[t+1]=e[t+3],e[t+3]=n,this._doCryptBlock(e,t,this._invKeySchedule,u,d,f,p,a);var n=e[t+1];e[t+1]=e[t+3],e[t+3]=n},_doCryptBlock:function(e,t,n,r,i,a,o,s){for(var c=this._nRounds,l=e[t]^n[0],u=e[t+1]^n[1],d=e[t+2]^n[2],f=e[t+3]^n[3],p=4,m=1;m<c;m++){var h=r[l>>>24]^i[u>>>16&255]^a[d>>>8&255]^o[f&255]^n[p++],g=r[u>>>24]^i[d>>>16&255]^a[f>>>8&255]^o[l&255]^n[p++],_=r[d>>>24]^i[f>>>16&255]^a[l>>>8&255]^o[u&255]^n[p++],v=r[f>>>24]^i[l>>>16&255]^a[u>>>8&255]^o[d&255]^n[p++];l=h,u=g,d=_,f=v}var h=(s[l>>>24]<<24|s[u>>>16&255]<<16|s[d>>>8&255]<<8|s[f&255])^n[p++],g=(s[u>>>24]<<24|s[d>>>16&255]<<16|s[f>>>8&255]<<8|s[l&255])^n[p++],_=(s[d>>>24]<<24|s[f>>>16&255]<<16|s[l>>>8&255]<<8|s[u&255])^n[p++],v=(s[f>>>24]<<24|s[l>>>16&255]<<16|s[u>>>8&255]<<8|s[d&255])^n[p++];e[t]=h,e[t+1]=g,e[t+2]=_,e[t+3]=v},keySize:8});t.AES=n._createHelper(h)})(),e.AES})})),R=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),h(),_(),D(),O()):typeof define==`function`&&define.amd?define([`./core`,`./enc-base64`,`./md5`,`./evpkdf`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib,r=n.WordArray,i=n.BlockCipher,a=t.algo,o=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],s=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],c=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],l=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],u=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],d=a.DES=i.extend({_doReset:function(){for(var e=this._key.words,t=[],n=0;n<56;n++){var r=o[n]-1;t[n]=e[r>>>5]>>>31-r%32&1}for(var i=this._subKeys=[],a=0;a<16;a++){for(var l=i[a]=[],u=c[a],n=0;n<24;n++)l[n/6|0]|=t[(s[n]-1+u)%28]<<31-n%6,l[4+(n/6|0)]|=t[28+(s[n+24]-1+u)%28]<<31-n%6;l[0]=l[0]<<1|l[0]>>>31;for(var n=1;n<7;n++)l[n]=l[n]>>>(n-1)*4+3;l[7]=l[7]<<5|l[7]>>>27}for(var d=this._invSubKeys=[],n=0;n<16;n++)d[n]=i[15-n]},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._subKeys)},decryptBlock:function(e,t){this._doCryptBlock(e,t,this._invSubKeys)},_doCryptBlock:function(e,t,n){this._lBlock=e[t],this._rBlock=e[t+1],f.call(this,4,252645135),f.call(this,16,65535),p.call(this,2,858993459),p.call(this,8,16711935),f.call(this,1,1431655765);for(var r=0;r<16;r++){for(var i=n[r],a=this._lBlock,o=this._rBlock,s=0,c=0;c<8;c++)s|=l[c][((o^i[c])&u[c])>>>0];this._lBlock=o,this._rBlock=a^s}var d=this._lBlock;this._lBlock=this._rBlock,this._rBlock=d,f.call(this,1,1431655765),p.call(this,8,16711935),p.call(this,2,858993459),f.call(this,16,65535),f.call(this,4,252645135),e[t]=this._lBlock,e[t+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});function f(e,t){var n=(this._lBlock>>>e^this._rBlock)&t;this._rBlock^=n,this._lBlock^=n<<e}function p(e,t){var n=(this._rBlock>>>e^this._lBlock)&t;this._lBlock^=n,this._rBlock^=n<<e}t.DES=i._createHelper(d);var m=a.TripleDES=i.extend({_doReset:function(){var e=this._key.words;if(e.length!==2&&e.length!==4&&e.length<6)throw Error(`Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.`);var t=e.slice(0,2),n=e.length<4?e.slice(0,2):e.slice(2,4),i=e.length<6?e.slice(0,2):e.slice(4,6);this._des1=d.createEncryptor(r.create(t)),this._des2=d.createEncryptor(r.create(n)),this._des3=d.createEncryptor(r.create(i))},encryptBlock:function(e,t){this._des1.encryptBlock(e,t),this._des2.decryptBlock(e,t),this._des3.encryptBlock(e,t)},decryptBlock:function(e,t){this._des3.decryptBlock(e,t),this._des2.encryptBlock(e,t),this._des1.decryptBlock(e,t)},keySize:6,ivSize:2,blockSize:2});t.TripleDES=i._createHelper(m)})(),e.TripleDES})})),re=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),h(),_(),D(),O()):typeof define==`function`&&define.amd?define([`./core`,`./enc-base64`,`./md5`,`./evpkdf`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.StreamCipher,r=t.algo,i=r.RC4=n.extend({_doReset:function(){for(var e=this._key,t=e.words,n=e.sigBytes,r=this._S=[],i=0;i<256;i++)r[i]=i;for(var i=0,a=0;i<256;i++){var o=i%n,s=t[o>>>2]>>>24-o%4*8&255;a=(a+r[i]+s)%256;var c=r[i];r[i]=r[a],r[a]=c}this._i=this._j=0},_doProcessBlock:function(e,t){e[t]^=a.call(this)},keySize:8,ivSize:0});function a(){for(var e=this._S,t=this._i,n=this._j,r=0,i=0;i<4;i++){t=(t+1)%256,n=(n+e[t])%256;var a=e[t];e[t]=e[n],e[n]=a,r|=e[(e[t]+e[n])%256]<<24-i*8}return this._i=t,this._j=n,r}t.RC4=n._createHelper(i);var o=r.RC4Drop=i.extend({cfg:i.cfg.extend({drop:192}),_doReset:function(){i._doReset.call(this);for(var e=this.cfg.drop;e>0;e--)a.call(this)}});t.RC4Drop=n._createHelper(o)})(),e.RC4})})),z=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),h(),_(),D(),O()):typeof define==`function`&&define.amd?define([`./core`,`./enc-base64`,`./md5`,`./evpkdf`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.StreamCipher,r=t.algo,i=[],a=[],o=[],s=r.Rabbit=n.extend({_doReset:function(){for(var e=this._key.words,t=this.cfg.iv,n=0;n<4;n++)e[n]=(e[n]<<8|e[n]>>>24)&16711935|(e[n]<<24|e[n]>>>8)&4278255360;var r=this._X=[e[0],e[3]<<16|e[2]>>>16,e[1],e[0]<<16|e[3]>>>16,e[2],e[1]<<16|e[0]>>>16,e[3],e[2]<<16|e[1]>>>16],i=this._C=[e[2]<<16|e[2]>>>16,e[0]&4294901760|e[1]&65535,e[3]<<16|e[3]>>>16,e[1]&4294901760|e[2]&65535,e[0]<<16|e[0]>>>16,e[2]&4294901760|e[3]&65535,e[1]<<16|e[1]>>>16,e[3]&4294901760|e[0]&65535];this._b=0;for(var n=0;n<4;n++)c.call(this);for(var n=0;n<8;n++)i[n]^=r[n+4&7];if(t){var a=t.words,o=a[0],s=a[1],l=(o<<8|o>>>24)&16711935|(o<<24|o>>>8)&4278255360,u=(s<<8|s>>>24)&16711935|(s<<24|s>>>8)&4278255360,d=l>>>16|u&4294901760,f=u<<16|l&65535;i[0]^=l,i[1]^=d,i[2]^=u,i[3]^=f,i[4]^=l,i[5]^=d,i[6]^=u,i[7]^=f;for(var n=0;n<4;n++)c.call(this)}},_doProcessBlock:function(e,t){var n=this._X;c.call(this),i[0]=n[0]^n[5]>>>16^n[3]<<16,i[1]=n[2]^n[7]>>>16^n[5]<<16,i[2]=n[4]^n[1]>>>16^n[7]<<16,i[3]=n[6]^n[3]>>>16^n[1]<<16;for(var r=0;r<4;r++)i[r]=(i[r]<<8|i[r]>>>24)&16711935|(i[r]<<24|i[r]>>>8)&4278255360,e[t+r]^=i[r]},blockSize:4,ivSize:2});function c(){for(var e=this._X,t=this._C,n=0;n<8;n++)a[n]=t[n];t[0]=t[0]+1295307597+this._b|0,t[1]=t[1]+3545052371+ +(t[0]>>>0<a[0]>>>0)|0,t[2]=t[2]+886263092+ +(t[1]>>>0<a[1]>>>0)|0,t[3]=t[3]+1295307597+ +(t[2]>>>0<a[2]>>>0)|0,t[4]=t[4]+3545052371+ +(t[3]>>>0<a[3]>>>0)|0,t[5]=t[5]+886263092+ +(t[4]>>>0<a[4]>>>0)|0,t[6]=t[6]+1295307597+ +(t[5]>>>0<a[5]>>>0)|0,t[7]=t[7]+3545052371+ +(t[6]>>>0<a[6]>>>0)|0,this._b=+(t[7]>>>0<a[7]>>>0);for(var n=0;n<8;n++){var r=e[n]+t[n],i=r&65535,s=r>>>16,c=((i*i>>>17)+i*s>>>15)+s*s,l=((r&4294901760)*r|0)+((r&65535)*r|0);o[n]=c^l}e[0]=o[0]+(o[7]<<16|o[7]>>>16)+(o[6]<<16|o[6]>>>16)|0,e[1]=o[1]+(o[0]<<8|o[0]>>>24)+o[7]|0,e[2]=o[2]+(o[1]<<16|o[1]>>>16)+(o[0]<<16|o[0]>>>16)|0,e[3]=o[3]+(o[2]<<8|o[2]>>>24)+o[1]|0,e[4]=o[4]+(o[3]<<16|o[3]>>>16)+(o[2]<<16|o[2]>>>16)|0,e[5]=o[5]+(o[4]<<8|o[4]>>>24)+o[3]|0,e[6]=o[6]+(o[5]<<16|o[5]>>>16)+(o[4]<<16|o[4]>>>16)|0,e[7]=o[7]+(o[6]<<8|o[6]>>>24)+o[5]|0}t.Rabbit=n._createHelper(s)})(),e.Rabbit})})),ie=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),h(),_(),D(),O()):typeof define==`function`&&define.amd?define([`./core`,`./enc-base64`,`./md5`,`./evpkdf`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.StreamCipher,r=t.algo,i=[],a=[],o=[],s=r.RabbitLegacy=n.extend({_doReset:function(){var e=this._key.words,t=this.cfg.iv,n=this._X=[e[0],e[3]<<16|e[2]>>>16,e[1],e[0]<<16|e[3]>>>16,e[2],e[1]<<16|e[0]>>>16,e[3],e[2]<<16|e[1]>>>16],r=this._C=[e[2]<<16|e[2]>>>16,e[0]&4294901760|e[1]&65535,e[3]<<16|e[3]>>>16,e[1]&4294901760|e[2]&65535,e[0]<<16|e[0]>>>16,e[2]&4294901760|e[3]&65535,e[1]<<16|e[1]>>>16,e[3]&4294901760|e[0]&65535];this._b=0;for(var i=0;i<4;i++)c.call(this);for(var i=0;i<8;i++)r[i]^=n[i+4&7];if(t){var a=t.words,o=a[0],s=a[1],l=(o<<8|o>>>24)&16711935|(o<<24|o>>>8)&4278255360,u=(s<<8|s>>>24)&16711935|(s<<24|s>>>8)&4278255360,d=l>>>16|u&4294901760,f=u<<16|l&65535;r[0]^=l,r[1]^=d,r[2]^=u,r[3]^=f,r[4]^=l,r[5]^=d,r[6]^=u,r[7]^=f;for(var i=0;i<4;i++)c.call(this)}},_doProcessBlock:function(e,t){var n=this._X;c.call(this),i[0]=n[0]^n[5]>>>16^n[3]<<16,i[1]=n[2]^n[7]>>>16^n[5]<<16,i[2]=n[4]^n[1]>>>16^n[7]<<16,i[3]=n[6]^n[3]>>>16^n[1]<<16;for(var r=0;r<4;r++)i[r]=(i[r]<<8|i[r]>>>24)&16711935|(i[r]<<24|i[r]>>>8)&4278255360,e[t+r]^=i[r]},blockSize:4,ivSize:2});function c(){for(var e=this._X,t=this._C,n=0;n<8;n++)a[n]=t[n];t[0]=t[0]+1295307597+this._b|0,t[1]=t[1]+3545052371+ +(t[0]>>>0<a[0]>>>0)|0,t[2]=t[2]+886263092+ +(t[1]>>>0<a[1]>>>0)|0,t[3]=t[3]+1295307597+ +(t[2]>>>0<a[2]>>>0)|0,t[4]=t[4]+3545052371+ +(t[3]>>>0<a[3]>>>0)|0,t[5]=t[5]+886263092+ +(t[4]>>>0<a[4]>>>0)|0,t[6]=t[6]+1295307597+ +(t[5]>>>0<a[5]>>>0)|0,t[7]=t[7]+3545052371+ +(t[6]>>>0<a[6]>>>0)|0,this._b=+(t[7]>>>0<a[7]>>>0);for(var n=0;n<8;n++){var r=e[n]+t[n],i=r&65535,s=r>>>16,c=((i*i>>>17)+i*s>>>15)+s*s,l=((r&4294901760)*r|0)+((r&65535)*r|0);o[n]=c^l}e[0]=o[0]+(o[7]<<16|o[7]>>>16)+(o[6]<<16|o[6]>>>16)|0,e[1]=o[1]+(o[0]<<8|o[0]>>>24)+o[7]|0,e[2]=o[2]+(o[1]<<16|o[1]>>>16)+(o[0]<<16|o[0]>>>16)|0,e[3]=o[3]+(o[2]<<8|o[2]>>>24)+o[1]|0,e[4]=o[4]+(o[3]<<16|o[3]>>>16)+(o[2]<<16|o[2]>>>16)|0,e[5]=o[5]+(o[4]<<8|o[4]>>>24)+o[3]|0,e[6]=o[6]+(o[5]<<16|o[5]>>>16)+(o[4]<<16|o[4]>>>16)|0,e[7]=o[7]+(o[6]<<8|o[6]>>>24)+o[5]|0}t.RabbitLegacy=n._createHelper(s)})(),e.RabbitLegacy})})),ae=o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),h(),_(),D(),O()):typeof define==`function`&&define.amd?define([`./core`,`./enc-base64`,`./md5`,`./evpkdf`,`./cipher-core`],r):r(n.CryptoJS)})(e,function(e){return(function(){var t=e,n=t.lib.BlockCipher,r=t.algo;let i=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],a=[[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946],[1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055],[3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504],[976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462]];var o={pbox:[],sbox:[]};function s(e,t){let n=t>>24&255,r=t>>16&255,i=t>>8&255,a=t&255,o=e.sbox[0][n]+e.sbox[1][r];return o^=e.sbox[2][i],o+=e.sbox[3][a],o}function c(e,t,n){let r=t,i=n,a;for(let t=0;t<16;++t)r^=e.pbox[t],i=s(e,r)^i,a=r,r=i,i=a;return a=r,r=i,i=a,i^=e.pbox[16],r^=e.pbox[17],{left:r,right:i}}function l(e,t,n){let r=t,i=n,a;for(let t=17;t>1;--t)r^=e.pbox[t],i=s(e,r)^i,a=r,r=i,i=a;return a=r,r=i,i=a,i^=e.pbox[1],r^=e.pbox[0],{left:r,right:i}}function u(e,t,n){for(let t=0;t<4;t++){e.sbox[t]=[];for(let n=0;n<256;n++)e.sbox[t][n]=a[t][n]}let r=0;for(let a=0;a<18;a++)e.pbox[a]=i[a]^t[r],r++,r>=n&&(r=0);let o=0,s=0,l=0;for(let t=0;t<18;t+=2)l=c(e,o,s),o=l.left,s=l.right,e.pbox[t]=o,e.pbox[t+1]=s;for(let t=0;t<4;t++)for(let n=0;n<256;n+=2)l=c(e,o,s),o=l.left,s=l.right,e.sbox[t][n]=o,e.sbox[t][n+1]=s;return!0}var d=r.Blowfish=n.extend({_doReset:function(){if(this._keyPriorReset!==this._key){var e=this._keyPriorReset=this._key,t=e.words;u(o,t,e.sigBytes/4)}},encryptBlock:function(e,t){var n=c(o,e[t],e[t+1]);e[t]=n.left,e[t+1]=n.right},decryptBlock:function(e,t){var n=l(o,e[t],e[t+1]);e[t]=n.left,e[t+1]=n.right},blockSize:2,keySize:4,ivSize:2});t.Blowfish=n._createHelper(d)})(),e.Blowfish})})),oe=c(o(((e,t)=>{(function(n,r,i){typeof e==`object`?t.exports=e=r(d(),f(),p(),m(),h(),g(),_(),v(),y(),b(),x(),S(),C(),w(),T(),E(),D(),O(),k(),A(),j(),M(),N(),P(),F(),I(),L(),ee(),te(),ne(),R(),re(),z(),ie(),ae()):typeof define==`function`&&define.amd?define(`./core,./x64-core,./lib-typedarrays,./enc-utf16,./enc-base64,./enc-base64url,./md5,./sha1,./sha256,./sha224,./sha512,./sha384,./sha3,./ripemd160,./hmac,./pbkdf2,./evpkdf,./cipher-core,./mode-cfb,./mode-ctr,./mode-ctr-gladman,./mode-ofb,./mode-ecb,./pad-ansix923,./pad-iso10126,./pad-iso97971,./pad-zeropadding,./pad-nopadding,./format-hex,./aes,./tripledes,./rc4,./rabbit,./rabbit-legacy,./blowfish`.split(`,`),r):n.CryptoJS=r(n.CryptoJS)})(e,function(e){return e})}))(),1),B=new Map,se=512;function ce(e,t,n,r){let i=`${e}:${t}:${n}:${r}`,a=B.get(i);if(a)return a;let o=oe.default.HmacSHA256(`${t}:${n}:${r}`,e).words,s=Array(32);for(let e=0;e<8;e++){let t=o[e],n=e<<2;s[n]=t>>>24&255,s[n+1]=t>>>16&255,s[n+2]=t>>>8&255,s[n+3]=t&255}if(B.size>=se){let e=B.keys().next().value;e!==void 0&&B.delete(e)}return B.set(i,s),s}function le(e,t,n,r,i){let a=ce(e,t,n,r),o=[0,1,2,3,4],s=[],c=0;for(let e=0;e<i;e++){let e=o.length,t=-1;for(;t===-1;){if(c>=16){t=0;break}let n=256-256%e,r=a[c];c++,r<n&&(t=r%e)}s.push(o[t]),o.splice(t,1)}return s}function ue(e,t,n,r,i=!1){let a=ce(e,t,n,r),o=a[16]%100<8?a[17]%5:null,s=a[18]%100<18,c=null;if(s){let e=a[19]%5;e===o&&(e=(e+1)%5),c=e}return{row:r,goldenLane:c,goldenBoost:1.5,alienLane:o,alienBoost:1,alienSkipRows:2}}function de(e,t,n,r,i,a,o=!1){let s=le(e,t,n,r,a),c=!s.includes(i),l=ue(e,t,n,r,!1),u=`NONE`,d=1,f=0;return i===l.alienLane?(u=`ALIEN`,c&&(f=l.alienSkipRows,d=l.alienBoost)):i===l.goldenLane&&(u=`GOLDEN`,c&&(d=l.goldenBoost)),{isSafe:c,specialType:u,boostFactor:d,rowsSkipped:f,hazards:s}}function fe(){return oe.default.lib.WordArray.random(32).toString(oe.default.enc.Hex)}function pe(e){return oe.default.SHA256(e).toString(oe.default.enc.Hex)}var me=25e4,he=1e6,ge=.96;function V(e,t){if(!Number.isFinite(e)||e<=0||!Number.isFinite(t)||t<1||t>4)return 1;let n=ge*(5/(5-t))**e;return Math.min(he,Math.floor(n*1e4)/1e4)}function _e(e){return(5-e)/5}function ve(e,t,n){let r=1/_e(t),i=n?ge:1,a=e*r*i;return Math.min(he,Math.floor(a*1e4)/1e4)}function ye(e,t=!1,n=!1,r=`base`){return Math.round(e*100)/100}function H(e,t){let n=e*t;return t>1e6&&(n=e*he),n>25e4&&(n=me),Math.floor(n*100)/100}var U=function(e){return e.IDLE=`IDLE`,e.PLAYING=`PLAYING`,e.WON=`WON`,e.CRASHED=`CRASHED`,e}({}),W=1e6,G=new class{session={sessionID:null,rgsUrl:null,currency:`USD`,language:`en`,device:`desktop`,isLiveRGS:!1,isSocial:!1,isReplay:!1,hasRgsParam:!1};activeBalance=250;currentRoundID=null;betConfig={minBet:.1,maxBet:100,stepBet:.1,defaultBetLevel:1,betLevels:[.1,.2,.5,1,2,5,10,20,50,100]};activeRoundData=null;isInitialized=!1;constructor(){this.parseUrlParameters()}parseUrlParameters(){if(typeof window>`u`)return this.session;let e=new URLSearchParams(window.location.search),t=e.get(`replay`)===`true`,n=e.get(`sessionID`)||e.get(`sessionId`)||e.get(`session_id`),r=e.get(`rgs_url`)||e.get(`rgsUrl`),i=(e.get(`currency`)||`USD`).toUpperCase(),a=(e.get(`lang`)||e.get(`language`)||`en`).toLowerCase().startsWith(`es`)?`es`:`en`,o=e.get(`device`)||`desktop`,s=!!r;r&&=r.replace(/^https?:\/\//i,``).replace(/\/+$/,``);let c=e.get(`social`)===`true`||[`XSC`,`SC`,`XGC`,`GC`,`XEC`].includes(i),l=!!(n&&r&&!t),u;if(t){let t=parseFloat(e.get(`amount`)||`1000000`)||1e6;u={game:e.get(`game`)||`endless-descent`,version:e.get(`version`)||`1.0`,mode:e.get(`mode`)||`base`,event:e.get(`event`)||``,amount:t/W,currency:i,language:a,social:c,device:o}}return this.session={sessionID:n,rgsUrl:r,currency:i,language:a,device:o,isLiveRGS:l,isSocial:c,isReplay:t,hasRgsParam:s,replayParams:u},this.betConfig=this.getDefaultBetConfig(i),this.session}getDefaultBetConfig(e){return e===`JPY`?{minBet:10,maxBet:5e4,stepBet:10,defaultBetLevel:100,betLevels:[10,20,50,100,200,500,1e3,2e3,5e3,1e4,2e4,5e4]}:e===`XGC`||e===`GC`?{minBet:1e3,maxBet:1e6,stepBet:1e3,defaultBetLevel:1e4,betLevels:[1e3,2e3,5e3,1e4,2e4,5e4,1e5,25e4,5e5,1e6]}:{minBet:.1,maxBet:100,stepBet:.1,defaultBetLevel:1,betLevels:[.1,.2,.5,1,2,5,10,20,50,100]}}async postRGS(e,t){if(!this.session.rgsUrl)throw Error(`[Stake RGS] Missing rgs_url parameter`);let n=`${this.session.rgsUrl.startsWith(`127.0.0.1`)||this.session.rgsUrl.startsWith(`localhost`)?`http`:`https`}://${this.session.rgsUrl}${e}`;try{let e=await fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`},body:JSON.stringify(t)}),r=await e.json().catch(()=>({}));return{ok:e.ok,status:e.status,data:r}}catch(e){return console.error(`[Stake RGS] Network error communicating with ${n}:`,e),{ok:!1,status:0,data:{status:{statusCode:`ERR_UE`,statusMessage:e instanceof Error?e.message:`Network communication failure`}}}}}async authenticate(){if(this.parseUrlParameters(),this.session.isReplay)return this.isInitialized=!0,{success:!0,balance:0,currency:this.session.currency,config:this.betConfig};if(!this.session.hasRgsParam)return this.isInitialized=!0,{success:!0,balance:this.activeBalance,currency:this.session.currency,config:this.betConfig};try{let e=await this.postRGS(`/wallet/authenticate`,{sessionID:this.session.sessionID||`anonymous_invalid_session`,language:this.session.language}),t=e.data,n=t?.status?.statusCode||(e.ok?`SUCCESS`:`ERR_VAL`);if(n===`SUCCESS`||e.ok){let e=t?.balance?.amount,r=typeof e==`number`?e/W:(parseFloat(e)||0)/W,i=(t?.balance?.currency||this.session.currency).toUpperCase();if(this.session.currency=i,this.activeBalance=r>=0?r:this.activeBalance,t?.config){let e=t.config,n=typeof e.minBet==`number`?e.minBet/W:this.betConfig.minBet,r=typeof e.maxBet==`number`?e.maxBet/W:this.betConfig.maxBet,i=typeof e.stepBet==`number`?e.stepBet/W:this.betConfig.stepBet,a=typeof e.defaultBetLevel==`number`?e.defaultBetLevel/W:this.betConfig.defaultBetLevel,o=this.betConfig.betLevels;Array.isArray(e.betLevels)&&e.betLevels.length>0&&(o=e.betLevels.map(e=>typeof e==`number`?e/W:parseFloat(e)/W)),e.jurisdiction?.socialCasino&&(this.session.isSocial=!0),this.betConfig={minBet:n,maxBet:r,stepBet:i,defaultBetLevel:a,betLevels:o}}let a;if(t?.round&&t?.round?.active){let e=t.round.amount,n=typeof e==`number`?e/W:(parseFloat(e)||0)/W;a={roundID:t.round.roundID,amount:n,payoutMultiplier:t.round.payoutMultiplier,active:!0,state:t.round.state},this.activeRoundData=a,this.currentRoundID=t.round.roundID||null}return this.isInitialized=!0,{success:!0,balance:this.activeBalance,currency:i,config:this.betConfig,activeRound:a,statusCode:n}}let r=this.translateRgsError(n,t?.status?.statusMessage||t?.message);return{success:!1,isConnectionError:!0,balance:0,currency:this.session.currency,config:this.betConfig,statusCode:n,errorMessage:r}}catch{let e=`Unable to connect to RGS host (${this.session.rgsUrl}).`;return{success:!1,isConnectionError:!0,balance:0,currency:this.session.currency,config:this.betConfig,statusCode:`ERR_UE`,errorMessage:e}}}async playBet(e,t=`base`){if(!this.session.isLiveRGS)return this.activeBalance=Math.max(0,Math.round((this.activeBalance-e)*100)/100),{success:!0,balance:this.activeBalance};let n=Math.round(e*W);try{let r=await this.postRGS(`/wallet/play`,{sessionID:this.session.sessionID,amount:n,currency:this.session.currency,mode:t}),i=r.data,a=i?.status?.statusCode||i?.error||(r.ok?`SUCCESS`:`ERR_UE`),o=String(i?.status?.statusMessage||i?.message||``);if((a===`SUCCESS`||r.ok)&&!o.toLowerCase().includes(`active round`)){let e=i?.balance?.amount,t=typeof e==`number`?e/W:(parseFloat(e)||0)/W;return this.activeBalance=t,this.currentRoundID=i?.round?.roundID||null,{success:!0,roundID:this.currentRoundID||void 0,payoutMultiplier:i?.round?.payoutMultiplier,balance:t,state:i?.round?.state,statusCode:a}}if(o.toLowerCase().includes(`active round`)&&(console.warn(`[Stake RGS] Detected active round on server. Clearing dangling round via /wallet/end-round...`),(await this.endRound()).success))return console.log(`[Stake RGS] Dangling round successfully cleared. Retrying playBet...`),await this.playBet(e,t);let s=this.translateRgsError(a,o);return this.showToast(s,`error`,4e3),{success:!1,statusCode:a,errorMessage:s}}catch{let e=`Failed to register bet on the RGS server.`;return this.showToast(e,`error`,4e3),{success:!1,statusCode:`ERR_UE`,errorMessage:e}}}async endRound(){if(!this.session.isLiveRGS)return{success:!0,balance:this.activeBalance};try{let e=await this.postRGS(`/wallet/end-round`,{sessionID:this.session.sessionID}),t=e.data,n=t?.status?.statusCode||(e.ok?`SUCCESS`:`ERR_UE`);if(n===`SUCCESS`||e.ok){let e=t?.balance?.amount;return e!==void 0&&(this.activeBalance=typeof e==`number`?e/W:(parseFloat(e)||0)/W),this.currentRoundID=null,this.activeRoundData=null,{success:!0,balance:this.activeBalance,statusCode:n}}return{success:!1,statusCode:n,errorMessage:t?.status?.statusMessage||t?.message}}catch{return{success:!1,statusCode:`ERR_UE`,errorMessage:`Error finalizing round on RGS`}}}async syncBalance(){if(!this.session.isLiveRGS)return this.activeBalance;try{let e=(await this.postRGS(`/wallet/balance`,{sessionID:this.session.sessionID})).data?.balance?.amount;e!==void 0&&(this.activeBalance=typeof e==`number`?e/W:(parseFloat(e)||0)/W)}catch{}return this.activeBalance}async fetchReplayEvent(){if(!this.session.isReplay||!this.session.replayParams)return{success:!1,errorMessage:`Not in replay mode`};let{game:e,version:t,mode:n,event:r}=this.session.replayParams;if(!this.session.rgsUrl)return{success:!1,errorMessage:`Missing rgs_url for replay`};let i=`${this.session.rgsUrl.startsWith(`127.0.0.1`)||this.session.rgsUrl.startsWith(`localhost`)?`http`:`https`}://${this.session.rgsUrl}/bet/replay/${e}/${t}/${n}/${r}`;try{let e=await fetch(i,{method:`GET`,headers:{Accept:`application/json`}});if(!e.ok)return{success:!1,errorMessage:`Replay fetch failed with status ${e.status}`};let t=await e.json();return{success:!0,payoutMultiplier:t?.payoutMultiplier??t?.round?.payoutMultiplier??0,costMultiplier:t?.costMultiplier??t?.round?.costMultiplier??1,state:t?.state??t?.round?.state??[]}}catch(e){return{success:!1,errorMessage:e instanceof Error?e.message:`Network error loading replay`}}}getCurrencySymbol(){if(this.session.isSocial||[`XSC`,`SC`,`XGC`,`GC`,`XEC`].includes(this.session.currency))return``;switch(this.session.currency){case`USD`:case`USDT`:case`USDC`:return`$`;case`CAD`:return`CA$`;case`MXN`:return`MX$`;case`EUR`:return`€`;case`JPY`:return`¥`;case`GBP`:return`£`;case`BTC`:return`₿`;case`ETH`:return`Ξ`;default:return`$`}}formatCurrency(e){let t=this.session.currency,n=e>0&&e<.01;if(t===`XSC`||t===`SC`||t===`XEC`){let t=n?4:2;return`${e.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:t})} SC`}if(t===`XGC`||t===`GC`){let t=n?4:2;return`${e.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:t})} GC`}if(t===`JPY`){let t=n?2:0;return`¥${e.toLocaleString(`en-US`,{minimumFractionDigits:t,maximumFractionDigits:t})}`}if(t===`CAD`){let t=n?4:2;return`CA$${e.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:t})}`}if(t===`MXN`){let t=n?4:2;return`MX$${e.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:t})}`}if(t===`EUR`){let t=n?4:2;return`€${e.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:t})}`}let r=this.getCurrencySymbol(),i=n?4:2;return`${r}${e.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:i})}`}translateRgsError(e,t){let n=this.session.language!==`es`;if(this.session.isSocial){if(e===`ERR_IPB`)return n?`Insufficient coins to place this play.`:`Monedas insuficientes para realizar esta jugada.`;if(e===`ERR_IS`||e===`ERR_ATE`||e===`ERR_VAL`)return n?`Play session expired or invalid. Please reload.`:`Sesión de juego expirada. Por favor recarga.`}switch(e){case`ERR_IPB`:return n?`Insufficient balance in your account.`:`Saldo insuficiente en tu cuenta para esta jugada.`;case`ERR_IS`:case`ERR_ATE`:case`ERR_VAL`:return n?`Session expired or unauthenticated. Please reload.`:`Sesión expirada o inválida. Por favor recarga el juego.`;case`ERR_GLE`:return n?`Gaming limit or self-exclusion reached.`:`Límite de juego o auto-exclusión alcanzado.`;case`ERR_BNF`:return n?`Round outcome not found on server.`:`Ronda no encontrada en el servidor.`;case`ERR_ACT`:return n?`Server busy. Please try again shortly.`:`Servidor ocupado. Intenta de nuevo en un momento.`;default:return t||(n?`Connection error with the RGS server.`:`Error de comunicación con el servidor RGS.`)}}showToast(e,t=`info`,n=3500){if(typeof document>`u`)return;let r=document.getElementById(`stake-toast-container`);r||(r=document.createElement(`div`),r.id=`stake-toast-container`,r.className=`stake-toast-container`,document.body.appendChild(r));let i=document.createElement(`div`);i.className=`stake-toast-item stake-toast-${t}`,i.innerHTML=`
            <div class="stake-toast-icon">${t===`success`?`<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#00e701" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`:t===`error`?`<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ff4949" stroke-width="2"/><path d="M12 8V12M12 16H12.01" stroke="#ff4949" stroke-width="2.5" stroke-linecap="round"/></svg>`:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#00f0ff" stroke-width="2"/><path d="M12 16V12M12 8H12.01" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/></svg>`}</div>
            <div class="stake-toast-message">${e}</div>
        `,r.appendChild(i),requestAnimationFrame(()=>{i.classList.add(`visible`)}),setTimeout(()=>{i.classList.remove(`visible`),setTimeout(()=>{i.remove()},300)},n)}},be=class{state=U.IDLE;betAmount=10;activeBetAmount=10;initialEffectiveBet=10;minesCount=3;balance=250;gameMode=`base`;luckyBoost=!1;shieldPurchased=!1;hasActiveShield=!1;shieldUsedInRound=!1;partialPayoutBanked=0;partialCashoutUsedOnRow=0;currentRow=0;currentMultiplier=1;lastChosenLane=2;lastCrashedRow=null;lastCrashedLane=null;alienDestroyedRows=new Set;serverSeed=``;clientSeed=``;previousServerSeed=``;nonce=0;currentPicks=[];recentSummaries=[];stateListeners=new Set;cashoutListeners=new Set;partialCashoutListeners=new Set;stepListeners=new Set;balanceListeners=new Set;historyListeners=new Set;constructor(e,t){this.serverSeed=e||fe(),this.clientSeed=t||`stake_player_1`,this.loadPersistedState()}loadPersistedState(){try{if(!G.session.isLiveRGS){let e=localStorage.getItem(`endless_descent_balance`);if(e!==null){let t=parseFloat(e);!isNaN(t)&&t>0&&(this.balance=t)}}let e=localStorage.getItem(`endless_descent_client_seed`);e&&(this.clientSeed=e);let t=localStorage.getItem(`endless_descent_nonce`);t&&(this.nonce=parseInt(t,10)||0)}catch{}}persistState(){try{G.session.isLiveRGS||localStorage.setItem(`endless_descent_balance`,this.balance.toFixed(2)),localStorage.setItem(`endless_descent_client_seed`,this.clientSeed),localStorage.setItem(`endless_descent_nonce`,this.nonce.toString())}catch{}}onStateChange(e){return this.stateListeners.add(e),()=>this.stateListeners.delete(e)}onCashout(e){return this.cashoutListeners.add(e),()=>this.cashoutListeners.delete(e)}onPartialCashout(e){return this.partialCashoutListeners.add(e),()=>this.partialCashoutListeners.delete(e)}onStep(e){return this.stepListeners.add(e),()=>this.stepListeners.delete(e)}onBalanceChange(e){return this.balanceListeners.add(e),()=>this.balanceListeners.delete(e)}onHistoryUpdate(e){return this.historyListeners.add(e),()=>this.historyListeners.delete(e)}setCallbacks(e,t){e&&this.onStateChange(e),t&&this.onCashout(t)}emitStateChange(e){this.state=e,this.stateListeners.forEach(t=>t(e,this))}emitBalanceChange(){this.persistState(),this.balanceListeners.forEach(e=>e(this.balance,this))}setBalance(e){this.balance=Math.max(0,Math.round(e*100)/100),this.emitBalanceChange()}emitHistoryUpdate(){this.historyListeners.forEach(e=>e(this.recentSummaries,this))}updateClientSeed(e){e.trim()&&(this.clientSeed=e.trim(),this.persistState())}adjustBalance(e){this.balance=Math.max(0,Math.round((this.balance+e)*100)/100),this.emitBalanceChange()}resetBalance(e=250){this.balance=e,this.emitBalanceChange()}getEffectiveBet(e=this.betAmount){return ye(e)}startBet(e,t,n=!1,r=!1,i=`base`){if(this.state===U.PLAYING||!Number.isFinite(e)||e<=0||!Number.isInteger(t)||t<1||t>4)return!1;let a=Math.min(1e6,Math.round(e*100)/100),o=a;if(!G.session.isLiveRGS&&this.balance<o)this.balance=Math.max(250,o*5),this.emitBalanceChange();else if(G.session.isLiveRGS&&this.balance<o)return G.showToast(`Saldo insuficiente en tu cuenta de Stake.`,`error`,3500),!1;return this.betAmount=a,this.activeBetAmount=o,this.initialEffectiveBet=o,this.minesCount=t,this.hasActiveShield=!1,this.shieldUsedInRound=!1,this.partialPayoutBanked=0,this.partialCashoutUsedOnRow=0,this.currentRow=1,this.currentMultiplier=1,this.lastCrashedRow=null,this.lastCrashedLane=null,this.currentPicks=[],this.alienDestroyedRows.clear(),this.nonce++,this.persistState(),this.adjustBalance(-o),this.emitStateChange(U.PLAYING),!0}getHazardsForActionRow(e){return le(this.serverSeed,this.clientSeed,this.nonce,e,this.minesCount)}getSpecialsForRow(e){return ue(this.serverSeed,this.clientSeed,this.nonce,e,this.luckyBoost)}pickLane(e){if(this.state!==U.PLAYING||!Number.isInteger(e)||e<0||e>4)return null;let t=this.currentRow,n=this.currentPicks.length===0,r=de(this.serverSeed,this.clientSeed,this.nonce,t,e,this.minesCount,!1);if(this.lastChosenLane=e,r.isSafe){let i=ve(this.currentMultiplier,this.minesCount,n);if(r.specialType===`GOLDEN`)i=Math.round(i*1.5*100)/100;else if(r.specialType===`ALIEN`)for(let e=0;e<r.rowsSkipped;e++)i=ve(i,this.minesCount,!1);this.currentMultiplier=i;let a={row:t,lane:e,isSafe:!0,shieldSaved:!1,specialType:r.specialType,boostApplied:r.boostFactor,rowsSkipped:r.rowsSkipped,hazards:r.hazards,stepMultiplierAfter:this.currentMultiplier};return this.currentPicks.push(a),this.currentRow=t+1+r.rowsSkipped,this.stepListeners.forEach(e=>e(a,this)),this.emitStateChange(U.PLAYING),a}this.lastCrashedRow=t,this.lastCrashedLane=e;let i={row:t,lane:e,isSafe:!1,shieldSaved:!1,specialType:r.specialType,boostApplied:0,rowsSkipped:0,hazards:r.hazards,stepMultiplierAfter:0};this.currentPicks.push(i);let a={id:`rnd_${Date.now()}_${this.nonce}`,betAmount:this.betAmount,effectiveBet:this.initialEffectiveBet,minesCount:this.minesCount,clearedRows:t-1,finalMultiplier:this.partialPayoutBanked>0?Math.round(this.partialPayoutBanked/this.initialEffectiveBet*100)/100:0,payout:this.partialPayoutBanked,partialPayoutBanked:this.partialPayoutBanked,isWin:this.partialPayoutBanked>0,luckyBoost:this.luckyBoost,shieldUsed:this.shieldUsedInRound,serverSeed:this.serverSeed,serverSeedHash:pe(this.serverSeed),clientSeed:this.clientSeed,nonce:this.nonce,picks:[...this.currentPicks],timestamp:Date.now()};return this.recentSummaries.unshift(a),this.recentSummaries.length>20&&this.recentSummaries.pop(),this.previousServerSeed=this.serverSeed,this.serverSeed=fe(),this.stepListeners.forEach(e=>e(i,this)),this.emitStateChange(U.CRASHED),this.emitHistoryUpdate(),i}partialCashout(){if(this.state!==U.PLAYING||this.currentRow<=1||this.partialCashoutUsedOnRow===this.currentRow)return null;let e=H(this.activeBetAmount,this.currentMultiplier),t=Math.floor(e*.5*100)/100;return t<.01?null:(this.adjustBalance(t),this.partialPayoutBanked=Math.round((this.partialPayoutBanked+t)*100)/100,this.activeBetAmount=Math.round(this.activeBetAmount*.5*1e4)/1e4,this.partialCashoutUsedOnRow=this.currentRow,this.partialCashoutListeners.forEach(e=>e(t,this.activeBetAmount,this)),this.emitStateChange(U.PLAYING),t)}canPartialCashout(){return this.state===U.PLAYING&&this.currentRow>1&&this.partialCashoutUsedOnRow!==this.currentRow&&this.activeBetAmount*this.currentMultiplier>=.04}cashout(){if(this.state!==U.PLAYING||this.currentRow<=1)return null;let e=H(this.activeBetAmount,this.currentMultiplier);this.adjustBalance(e);let t=Math.round((e+this.partialPayoutBanked)*100)/100,n=Math.round(t/this.initialEffectiveBet*1e4)/1e4,r={id:`rnd_${Date.now()}_${this.nonce}`,betAmount:this.betAmount,effectiveBet:this.initialEffectiveBet,minesCount:this.minesCount,clearedRows:this.currentRow-1,finalMultiplier:n,payout:t,partialPayoutBanked:this.partialPayoutBanked,isWin:!0,luckyBoost:this.luckyBoost,shieldUsed:this.shieldUsedInRound,serverSeed:this.serverSeed,serverSeedHash:pe(this.serverSeed),clientSeed:this.clientSeed,nonce:this.nonce,picks:[...this.currentPicks],timestamp:Date.now()};return this.recentSummaries.unshift(r),this.recentSummaries.length>20&&this.recentSummaries.pop(),this.previousServerSeed=this.serverSeed,this.serverSeed=fe(),this.emitStateChange(U.WON),this.emitHistoryUpdate(),this.cashoutListeners.forEach(e=>e(t,n,this)),t}resetToIdle(){this.currentRow=1,this.currentMultiplier=1,this.lastChosenLane=2,this.lastCrashedRow=null,this.lastCrashedLane=null,this.currentPicks=[],this.alienDestroyedRows.clear(),this.emitStateChange(U.IDLE)}},xe=new class{ctx=null;muted=!1;droneOsc1=null;droneOsc2=null;droneFilter=null;droneGain=null;isDronePlaying=!1;isBgmPlaying=!1;nextStepTime=0;current16thStep=0;bgmIntensityFactor=0;bgmMasterGain=null;snareNoiseBuffer=null;hatNoiseBuffer=null;cardboardNoiseBuffer=null;crashNoiseBuffer=null;constructor(){}initContext(){if(!this.ctx){let e=window.AudioContext||window.webkitAudioContext;this.ctx=new e,this.prebakeNoiseBuffers()}this.ctx.state===`suspended`&&this.ctx.resume()}prebakeNoiseBuffers(){if(!this.ctx)return;let e=this.ctx.sampleRate,t=(t,n)=>{let r=Math.floor(e*t),i=this.ctx.createBuffer(1,r,e),a=i.getChannelData(0);for(let e=0;e<r;e++)a[e]=(Math.random()*2-1)*Math.exp(-e/(r*n));return i};this.snareNoiseBuffer=t(.11,.35),this.hatNoiseBuffer=t(.04,.3),this.cardboardNoiseBuffer=t(.16,.38);let n=Math.floor(e*.55);this.crashNoiseBuffer=this.ctx.createBuffer(1,n,e);let r=this.crashNoiseBuffer.getChannelData(0);for(let e=0;e<n;e++)r[e]=Math.random()*2-1}setMuted(e){if(this.muted=e,!this.ctx)return;let t=this.ctx.currentTime;this.droneGain&&this.droneGain.gain.setTargetAtTime(this.muted?0:.009,t,.08),this.bgmMasterGain&&this.bgmMasterGain.gain.setTargetAtTime(this.muted?0:.14,t,.1)}isMuted(){return this.muted}toggleMute(){return this.setMuted(!this.muted),!this.muted}startAmbientDrone(){if(this.initContext(),!this.ctx)return;let e=this.ctx.currentTime;this.isDronePlaying||=(this.droneOsc1=this.ctx.createOscillator(),this.droneOsc2=this.ctx.createOscillator(),this.droneFilter=this.ctx.createBiquadFilter(),this.droneGain=this.ctx.createGain(),this.droneOsc1.type=`sine`,this.droneOsc1.frequency.setValueAtTime(42,e),this.droneOsc2.type=`triangle`,this.droneOsc2.frequency.setValueAtTime(63,e),this.droneFilter.type=`lowpass`,this.droneFilter.frequency.setValueAtTime(92,e),this.droneFilter.Q.setValueAtTime(.7,e),this.droneGain.gain.setValueAtTime(1e-4,e),this.droneGain.gain.linearRampToValueAtTime(this.muted?1e-4:.009,e+1),this.droneOsc1.connect(this.droneFilter),this.droneOsc2.connect(this.droneFilter),this.droneFilter.connect(this.droneGain),this.droneGain.connect(this.ctx.destination),this.droneOsc1.start(e),this.droneOsc2.start(e),!0),this.isBgmPlaying||this.startSynthwaveBGM()}startSynthwaveBGM(){if(!this.ctx||this.isBgmPlaying)return;this.bgmMasterGain=this.ctx.createGain(),this.bgmMasterGain.gain.setValueAtTime(this.muted?0:.14,this.ctx.currentTime),this.bgmMasterGain.connect(this.ctx.destination),this.isBgmPlaying=!0,this.current16thStep=0,this.nextStepTime=this.ctx.currentTime+.06;let e=60/118/4;window.setInterval(()=>{if(this.ctx&&this.isBgmPlaying)for(this.ctx.currentTime-this.nextStepTime>.25&&(this.nextStepTime=this.ctx.currentTime+.04);this.nextStepTime<this.ctx.currentTime+.12;)this.scheduleBgmStep(this.current16thStep,this.nextStepTime,e),this.nextStepTime+=e,this.current16thStep=(this.current16thStep+1)%64},25)}scheduleBgmStep(e,t,n){if(!this.ctx||!this.bgmMasterGain||this.muted)return;let r=Math.floor(e/16),i=e%16,a=[73.42,58.27,49,55][r],o=i%4==2?a*2:a,s=i%4==0?.55:i%2==0?.85:.7;this.triggerSynthBassNote(o,t,n*.82,s);let c=[[293.66,349.23,440,523.25,659.25,523.25,440,349.23],[233.08,293.66,349.23,440,587.33,440,349.23,293.66],[196,233.08,293.66,349.23,440,349.23,293.66,233.08],[220,293.66,329.63,392,440,392,329.63,277.18]];if(i%2==0||i===7||i===15){let e=Math.floor(i/2)%8,a=c[r][e];this.triggerArpPluck(a,t,n*1.4)}i===0&&this.triggerSynthPadChord([[146.83,220,261.63,349.23],[116.54,174.61,220,293.66],[98,146.83,174.61,233.08],[110,164.81,196,277.18]][r],t,n*15.8),i===0||i===8?this.triggerSoftKick(t):i===4||i===12?this.triggerSoftSnare(t):i%2==1&&this.triggerSoftHat(t)}triggerSynthBassNote(e,t,n,r){if(!this.ctx||!this.bgmMasterGain)return;let i=this.ctx.createOscillator(),a=this.ctx.createBiquadFilter(),o=this.ctx.createGain();i.type=`sawtooth`,i.frequency.setValueAtTime(e,t);let s=240+this.bgmIntensityFactor*110;a.type=`lowpass`,a.frequency.setValueAtTime(s*2.2,t),a.frequency.exponentialRampToValueAtTime(s,t+n*.85),a.Q.setValueAtTime(2.2,t),o.gain.setValueAtTime(.001,t),o.gain.linearRampToValueAtTime(.22*r,t+.01),o.gain.exponentialRampToValueAtTime(.001,t+n),i.connect(a),a.connect(o),o.connect(this.bgmMasterGain),i.start(t),i.stop(t+n+.01)}triggerArpPluck(e,t,n){if(!this.ctx||!this.bgmMasterGain)return;let r=this.ctx.createOscillator(),i=this.ctx.createBiquadFilter(),a=this.ctx.createGain();r.type=`triangle`,r.frequency.setValueAtTime(e,t),i.type=`lowpass`,i.frequency.setValueAtTime(1600+this.bgmIntensityFactor*450,t),i.frequency.exponentialRampToValueAtTime(480,t+n),a.gain.setValueAtTime(.001,t),a.gain.linearRampToValueAtTime(.095,t+.012),a.gain.exponentialRampToValueAtTime(.001,t+n),r.connect(i),i.connect(a),a.connect(this.bgmMasterGain),r.start(t),r.stop(t+n+.01)}triggerSynthPadChord(e,t,n){if(!this.ctx||!this.bgmMasterGain)return;let r=this.ctx.createBiquadFilter(),i=this.ctx.createGain();r.type=`lowpass`,r.frequency.setValueAtTime(620+this.bgmIntensityFactor*180,t),i.gain.setValueAtTime(.001,t),i.gain.linearRampToValueAtTime(.045,t+.35),i.gain.setValueAtTime(.045,t+n-.35),i.gain.linearRampToValueAtTime(.001,t+n),r.connect(i),i.connect(this.bgmMasterGain),e.forEach((e,i)=>{if(!this.ctx)return;let a=this.ctx.createOscillator();a.type=i%2==0?`sine`:`triangle`,a.frequency.setValueAtTime(e,t),a.detune.setValueAtTime((i-1.5)*6,t),a.connect(r),a.start(t),a.stop(t+n+.02)})}triggerSoftKick(e){if(!this.ctx||!this.bgmMasterGain)return;let t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sine`,t.frequency.setValueAtTime(115,e),t.frequency.exponentialRampToValueAtTime(36,e+.12),n.gain.setValueAtTime(.28,e),n.gain.exponentialRampToValueAtTime(.001,e+.16),t.connect(n),n.connect(this.bgmMasterGain),t.start(e),t.stop(e+.17)}triggerSoftSnare(e){if(!this.ctx||!this.bgmMasterGain||!this.snareNoiseBuffer)return;let t=this.ctx.createBufferSource();t.buffer=this.snareNoiseBuffer;let n=this.ctx.createBiquadFilter();n.type=`bandpass`,n.frequency.setValueAtTime(1450,e),n.Q.setValueAtTime(1.2,e);let r=this.ctx.createGain();r.gain.setValueAtTime(.11,e),r.gain.exponentialRampToValueAtTime(.001,e+.11),t.connect(n),n.connect(r),r.connect(this.bgmMasterGain),t.start(e)}triggerSoftHat(e){if(!this.ctx||!this.bgmMasterGain||!this.hatNoiseBuffer)return;let t=this.ctx.createBufferSource();t.buffer=this.hatNoiseBuffer;let n=this.ctx.createBiquadFilter();n.type=`highpass`,n.frequency.setValueAtTime(6500,e);let r=this.ctx.createGain();r.gain.setValueAtTime(.035,e),r.gain.exponentialRampToValueAtTime(.001,e+.04),t.connect(n),n.connect(r),r.connect(this.bgmMasterGain),t.start(e)}updateDroneIntensity(e){if(this.bgmIntensityFactor=Math.min(2.5,Math.log2(Math.max(1,e)+1)),!this.ctx||!this.isDronePlaying||!this.droneOsc1||!this.droneOsc2||!this.droneFilter)return;let t=this.ctx.currentTime;this.droneOsc1.frequency.setTargetAtTime(42+this.bgmIntensityFactor*4,t,.25),this.droneOsc2.frequency.setTargetAtTime(63+this.bgmIntensityFactor*6,t,.25),this.droneFilter.frequency.setTargetAtTime(92+this.bgmIntensityFactor*12,t,.25)}playHoverTick(e=2){if(this.muted||(this.initContext(),!this.ctx))return;let t=this.ctx.currentTime,n=this.ctx.createOscillator(),r=this.ctx.createGain(),i=[640,760,890,1040,1200],a=i[e%i.length]||890;n.type=`sine`,n.frequency.setValueAtTime(a,t),n.frequency.exponentialRampToValueAtTime(a*1.35,t+.03),r.gain.setValueAtTime(.032,t),r.gain.exponentialRampToValueAtTime(8e-4,t+.03),n.connect(r),r.connect(this.ctx.destination),n.start(t),n.stop(t+.034)}playClick(){if(this.muted||(this.initContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`triangle`,t.frequency.setValueAtTime(540,e),t.frequency.exponentialRampToValueAtTime(1450,e+.055),n.gain.setValueAtTime(.085,e),n.gain.exponentialRampToValueAtTime(.001,e+.06),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.065)}playHitStopTension(e=300,t=1){if(this.muted||(this.initContext(),!this.ctx))return;let n=this.ctx.currentTime,r=e/1e3,i=190+Math.min(t*30,440),a=this.ctx.createOscillator(),o=this.ctx.createGain();a.type=`sawtooth`,a.frequency.setValueAtTime(i,n),a.frequency.exponentialRampToValueAtTime(i*3.1,n+r);let s=this.ctx.createBiquadFilter();s.type=`bandpass`,s.frequency.setValueAtTime(i*1.5,n),s.frequency.exponentialRampToValueAtTime(i*4.5,n+r),s.Q.setValueAtTime(4,n),o.gain.setValueAtTime(.015,n),o.gain.linearRampToValueAtTime(.16,n+r*.88),o.gain.exponentialRampToValueAtTime(.001,n+r),a.connect(s),s.connect(o),o.connect(this.ctx.destination),a.start(n),a.stop(n+r+.02);let c=this.ctx.createOscillator(),l=this.ctx.createGain();c.type=`sine`,c.frequency.setValueAtTime(110,n),c.frequency.exponentialRampToValueAtTime(38,n+r*.7),l.gain.setValueAtTime(.22,n),l.gain.exponentialRampToValueAtTime(.001,n+r*.8),c.connect(l),l.connect(this.ctx.destination),c.start(n),c.stop(n+r*.85)}playSafeStep(e){if(this.muted||(this.initContext(),!this.ctx))return;let t=this.ctx.currentTime,n=[293.66,349.23,440,523.25,587.33,659.25,880,1046.5],r=n[(e-1)%n.length]*(1+Math.floor((e-1)/n.length)*.25),i=this.ctx.createOscillator(),a=this.ctx.createGain();if(i.type=`triangle`,i.frequency.setValueAtTime(160,t),i.frequency.exponentialRampToValueAtTime(38,t+.16),a.gain.setValueAtTime(.28,t),a.gain.exponentialRampToValueAtTime(.001,t+.18),i.connect(a),a.connect(this.ctx.destination),i.start(t),i.stop(t+.19),this.cardboardNoiseBuffer){let e=this.ctx.createBufferSource();e.buffer=this.cardboardNoiseBuffer;let n=this.ctx.createBiquadFilter();n.type=`bandpass`,n.frequency.setValueAtTime(1100,t),n.Q.setValueAtTime(1.6,t);let r=this.ctx.createGain();r.gain.setValueAtTime(.26,t),r.gain.exponentialRampToValueAtTime(.001,t+.15),e.connect(n),n.connect(r),r.connect(this.ctx.destination),e.start(t)}[2650,3420,4180,4960,5840,6420].forEach((e,n)=>{if(!this.ctx)return;let r=n*.018+Math.random()*.012,i=this.ctx.createOscillator(),a=this.ctx.createGain();i.type=`sine`,i.frequency.setValueAtTime(e,t+r),i.frequency.exponentialRampToValueAtTime(e*.86,t+r+.065),a.gain.setValueAtTime(.055/(1+n*.2),t+r),a.gain.exponentialRampToValueAtTime(8e-4,t+r+.07),i.connect(a),a.connect(this.ctx.destination),i.start(t+r),i.stop(t+r+.075)}),[1,1.25,1.5,2].forEach((e,n)=>{if(!this.ctx)return;let i=this.ctx.createOscillator(),a=this.ctx.createGain();i.type=n%2==0?`triangle`:`sine`;let o=r*e;i.frequency.setValueAtTime(o,t+n*.024),i.frequency.exponentialRampToValueAtTime(o*1.04,t+n*.024+.28),a.gain.setValueAtTime(.12/(n*.45+1),t+n*.024),a.gain.exponentialRampToValueAtTime(8e-4,t+n*.024+.34),i.connect(a),a.connect(this.ctx.destination),i.start(t+n*.024),i.stop(t+n*.024+.36)})}playGoldenHit(){if(this.muted||(this.initContext(),!this.ctx))return;this.playSafeStep(6);let e=this.ctx.currentTime;[523.25,659.25,783.99,1046.5,1318.5,1567.98,2093].forEach((t,n)=>{if(!this.ctx)return;let r=this.ctx.createOscillator(),i=this.ctx.createGain();r.type=`triangle`,r.frequency.setValueAtTime(t,e+n*.036),i.gain.setValueAtTime(.14,e+n*.036),i.gain.exponentialRampToValueAtTime(.001,e+n*.036+.4),r.connect(i),i.connect(this.ctx.destination),r.start(e+n*.036),r.stop(e+n*.036+.42)})}playAlienLaser(){if(this.muted||(this.initContext(),!this.ctx))return;this.playSafeStep(8);let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sawtooth`,t.frequency.setValueAtTime(1680,e),t.frequency.exponentialRampToValueAtTime(160,e+.34),t.frequency.exponentialRampToValueAtTime(980,e+.56),n.gain.setValueAtTime(.18,e),n.gain.exponentialRampToValueAtTime(.001,e+.6),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.62)}playShieldBreak(){if(this.muted||(this.initContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`square`,t.frequency.setValueAtTime(680,e),t.frequency.exponentialRampToValueAtTime(92,e+.4),n.gain.setValueAtTime(.2,e),n.gain.exponentialRampToValueAtTime(.001,e+.42),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.44)}playCrash(){if(this.muted||(this.initContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();if(t.type=`sawtooth`,t.frequency.setValueAtTime(155,e),t.frequency.exponentialRampToValueAtTime(20,e+.72),n.gain.setValueAtTime(.38,e),n.gain.exponentialRampToValueAtTime(.001,e+.75),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.78),this.crashNoiseBuffer){let t=this.ctx.createBufferSource();t.buffer=this.crashNoiseBuffer;let n=this.ctx.createBiquadFilter();n.type=`lowpass`,n.frequency.setValueAtTime(1250,e),n.frequency.exponentialRampToValueAtTime(85,e+.52);let r=this.ctx.createGain();r.gain.setValueAtTime(.32,e),r.gain.exponentialRampToValueAtTime(.001,e+.54),t.connect(n),n.connect(r),r.connect(this.ctx.destination),t.start(e)}}playPartialCashout(){if(this.muted||(this.initContext(),!this.ctx))return;let e=this.ctx.currentTime;[440,659.25,880].forEach((t,n)=>{if(!this.ctx)return;let r=this.ctx.createOscillator(),i=this.ctx.createGain();r.type=`sine`,r.frequency.setValueAtTime(t,e+n*.05),i.gain.setValueAtTime(.12,e+n*.05),i.gain.exponentialRampToValueAtTime(.001,e+n*.05+.25),r.connect(i),i.connect(this.ctx.destination),r.start(e+n*.05),r.stop(e+n*.05+.28)})}playCashout(e=!1){if(this.muted||(this.initContext(),!this.ctx))return;let t=this.ctx.currentTime,n=this.ctx.createOscillator(),r=this.ctx.createGain();n.type=`sine`,n.frequency.setValueAtTime(125,t),n.frequency.exponentialRampToValueAtTime(28,t+.55),r.gain.setValueAtTime(.38,t),r.gain.exponentialRampToValueAtTime(.001,t+.58),n.connect(r),r.connect(this.ctx.destination),n.start(t),n.stop(t+.6);let i=this.ctx.createOscillator(),a=this.ctx.createGain();i.type=`square`,i.frequency.setValueAtTime(320,t),i.frequency.exponentialRampToValueAtTime(75,t+.065),a.gain.setValueAtTime(.16,t),a.gain.exponentialRampToValueAtTime(.001,t+.07),i.connect(a),a.connect(this.ctx.destination),i.start(t),i.stop(t+.075),(e?[523.25,659.25,783.99,1046.5,1318.5,1567.98,2093]:[440,554.37,659.25,880,1108.73]).forEach((n,r)=>{if(!this.ctx)return;let i=this.ctx.createOscillator(),a=this.ctx.createGain();i.type=e?`triangle`:`sine`,i.frequency.setValueAtTime(n,t+r*.052),a.gain.setValueAtTime(.17,t+r*.052),a.gain.exponentialRampToValueAtTime(.001,t+r*.052+.52),i.connect(a),a.connect(this.ctx.destination),i.start(t+r*.052),i.stop(t+r*.052+.55)})}playStartRound(){this.playClick()}},Se=[`WARP LOCK!`,`QUANTUM SURGE!`,`HYPER-THRUST!`,`CORE OVERDRIVE!`,`PLASMA BREACH!`,`SUPERNOVA LOCK!`],Ce=[`#00f0ff`,`#38bdf8`,`#fde047`,`#f59e0b`,`#10b981`],we=class{engine;isHitStopActive=!1;hitStopRow=null;hitStopLane=null;hitStopProgress=0;activeComicWord=`WARP LOCK!`;activeSprayColor=`#00f0ff`;isMegaWinActive=!1;turboMode=!1;hitStopStartListeners=new Set;hitStopResolveListeners=new Set;megaWinListeners=new Set;constructor(e){this.engine=e,this.engine.onCashout((e,t)=>{let n=t>=2||e>=25;xe.playCashout(n),this.triggerMegaWin(e,t,`IS YOUR LUCKY DAY, TRY AGAIN`)}),this.engine.onPartialCashout(()=>{xe.playPartialCashout()})}onHitStopStart(e){return this.hitStopStartListeners.add(e),()=>this.hitStopStartListeners.delete(e)}onHitStopResolve(e){return this.hitStopResolveListeners.add(e),()=>this.hitStopResolveListeners.delete(e)}onMegaWin(e){return this.megaWinListeners.add(e),()=>this.megaWinListeners.delete(e)}triggerMegaWin(e,t,n=`SUPERNOVA MEGA EXTRACTION!`){this.isMegaWinActive=!0,this.megaWinListeners.forEach(r=>r(e,t,n))}selectLaneWithHitStop(e,t=!1){if(this.engine.state!==U.PLAYING||this.isHitStopActive||e<0||e>4)return Promise.resolve(null);let n=this.engine.currentRow,r=this.engine.getSpecialsForRow(n),i=e===r.alienLane||e===r.goldenLane?360:150,a=this.turboMode?Math.round(i*.45):t?Math.round(i*.6):i;return this.isHitStopActive=!0,this.hitStopRow=n,this.hitStopLane=e,this.hitStopProgress=0,this.activeComicWord=Se[(n+e)%Se.length],this.activeSprayColor=Ce[(n*2+e)%Ce.length],xe.startAmbientDrone(),xe.playHitStopTension(a,n),this.hitStopStartListeners.forEach(t=>t(n,e,a,this.activeComicWord,this.activeSprayColor)),new Promise(t=>{let n=performance.now(),r=i=>{let o=i-n;if(this.hitStopProgress=Math.min(1,o/a),o<a)requestAnimationFrame(r);else{this.isHitStopActive=!1,this.hitStopRow=null,this.hitStopLane=null,this.hitStopProgress=0;let n=this.engine.pickLane(e);n&&(xe.updateDroneIntensity(this.engine.currentMultiplier),n.isSafe?n.specialType===`ALIEN`?xe.playAlienLaser():n.specialType===`GOLDEN`?xe.playGoldenHit():xe.playSafeStep(n.row):n.shieldSaved?xe.playShieldBreak():xe.playCrash(),this.hitStopResolveListeners.forEach(e=>e(n))),t(n)}};requestAnimationFrame(r)})}getAtmosphereTheme(){let e=this.engine.currentMultiplier,t=this.engine.currentRow;return this.engine.state===U.CRASHED?{tier:-1,name:`CRITICAL HULL BREACH`,primaryHex:16719426,secondaryHex:16096779,accentCss:`#ff1e42`,glowCss:`rgba(255, 30, 66, 0.78)`,bgTopHex:1704712,bgBottomHex:3868434}:t>=12||e>=15?{tier:3,name:`EVENT HORIZON ESCAPE`,primaryHex:16638023,secondaryHex:16096779,accentCss:`#fde047`,glowCss:`rgba(253, 224, 71, 0.75)`,bgTopHex:1312550,bgBottomHex:3871060}:t>=8||e>=5?{tier:2,name:`QUANTUM VOID SECTOR`,primaryHex:12616956,secondaryHex:11032055,accentCss:`#c084fc`,glowCss:`rgba(192, 132, 252, 0.70)`,bgTopHex:787484,bgBottomHex:2231360}:t>=4||e>=2?{tier:1,name:`PLASMA REACTOR CORE`,primaryHex:61695,secondaryHex:3718648,accentCss:`#00f0ff`,glowCss:`rgba(0, 240, 255, 0.65)`,bgTopHex:201768,bgBottomHex:338512}:{tier:0,name:`TITANIUM INDUSTRIAL SHAFT`,primaryHex:3718648,secondaryHex:16096779,accentCss:`#38bdf8`,glowCss:`rgba(56, 189, 248, 0.55)`,bgTopHex:329745,bgBottomHex:725798}}},Te=1e3,Ee=1001,De=1002,Oe=1003,ke=1004,Ae=1005,je=1006,Me=1007,Ne=1008,Pe=1009,Fe=1010,Ie=1011,Le=1012,Re=1013,ze=1014,Be=1015,Ve=1016,He=1017,Ue=1018,We=1020,Ge=35902,Ke=35899,qe=1021,Je=1022,Ye=1023,Xe=1026,Ze=1027,Qe=1028,$e=1029,et=1030,tt=1031,nt=1033,rt=33776,it=33777,at=33778,ot=33779,st=35840,ct=35841,lt=35842,ut=35843,dt=36196,ft=37492,pt=37496,mt=37488,ht=37489,gt=37490,_t=37491,vt=37808,yt=37809,bt=37810,xt=37811,St=37812,Ct=37813,wt=37814,Tt=37815,Et=37816,Dt=37817,Ot=37818,kt=37819,At=37820,jt=37821,Mt=36492,Nt=36494,Pt=36495,Ft=36283,It=36284,Lt=36285,Rt=36286,zt=2300,Bt=2301,Vt=2302,Ht=2303,Ut=2400,Wt=2401,Gt=2402,Kt=3200,qt=`srgb`,Jt=`srgb-linear`,Yt=`linear`,Xt=`srgb`,Zt=7680,Qt=35044,$t=35048,en=2e3;function tn(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function nn(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function rn(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function an(){let e=rn(`canvas`);return e.style.display=`block`,e}var on={};function sn(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function cn(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function K(...e){e=cn(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function q(...e){e=cn(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function ln(...e){let t=e.join(` `);t in on||(on[t]=!0,K(...e))}function un(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var dn={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},fn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},pn=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),mn=1234567,hn=Math.PI/180,gn=180/Math.PI;function _n(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(pn[e&255]+pn[e>>8&255]+pn[e>>16&255]+pn[e>>24&255]+`-`+pn[t&255]+pn[t>>8&255]+`-`+pn[t>>16&15|64]+pn[t>>24&255]+`-`+pn[n&63|128]+pn[n>>8&255]+`-`+pn[n>>16&255]+pn[n>>24&255]+pn[r&255]+pn[r>>8&255]+pn[r>>16&255]+pn[r>>24&255]).toLowerCase()}function vn(e,t,n){return Math.max(t,Math.min(n,e))}function yn(e,t){return(e%t+t)%t}function bn(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function xn(e,t,n){return e===t?0:(n-e)/(t-e)}function Sn(e,t,n){return(1-n)*e+n*t}function Cn(e,t,n,r){return Sn(e,t,1-Math.exp(-n*r))}function wn(e,t=1){return t-Math.abs(yn(e,t*2)-t)}function Tn(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function En(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function Dn(e,t){return e+Math.floor(Math.random()*(t-e+1))}function On(e,t){return e+Math.random()*(t-e)}function kn(e){return e*(.5-Math.random())}function An(e){e!==void 0&&(mn=e);let t=mn+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function jn(e){return e*hn}function Mn(e){return e*gn}function Nn(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Pn(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Fn(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function In(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:K(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ln(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function Rn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var J={DEG2RAD:hn,RAD2DEG:gn,generateUUID:_n,clamp:vn,euclideanModulo:yn,mapLinear:bn,inverseLerp:xn,lerp:Sn,damp:Cn,pingpong:wn,smoothstep:Tn,smootherstep:En,randInt:Dn,randFloat:On,randFloatSpread:kn,seededRandom:An,degToRad:jn,radToDeg:Mn,isPowerOfTwo:Nn,ceilPowerOfTwo:Pn,floorPowerOfTwo:Fn,setQuaternionFromProperEuler:In,normalize:Rn,denormalize:Ln},Y=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=vn(this.x,e.x,t.x),this.y=vn(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=vn(this.x,e,t),this.y=vn(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(vn(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(vn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},zn=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:K(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(vn(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},X=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Vn.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Vn.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=vn(this.x,e.x,t.x),this.y=vn(this.y,e.y,t.y),this.z=vn(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=vn(this.x,e,t),this.y=vn(this.y,e,t),this.z=vn(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(vn(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Bn.copy(this).projectOnVector(e),this.sub(Bn)}reflect(e){return this.sub(Bn.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(vn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Bn=new X,Vn=new zn,Hn=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return ln(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Un.makeScale(e,t)),this}rotate(e){return ln(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Un.makeRotation(-e)),this}translate(e,t){return ln(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Un.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Un=new Hn,Wn=new Hn().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Gn=new Hn().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kn(){let e={enabled:!0,workingColorSpace:Jt,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Jn(e.r),e.g=Jn(e.g),e.b=Jn(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Yn(e.r),e.g=Yn(e.g),e.b=Yn(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Yt:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return ln(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return ln(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Jt]:{primaries:t,whitePoint:r,transfer:Yt,toXYZ:Wn,fromXYZ:Gn,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:qt},outputColorSpaceConfig:{drawingBufferColorSpace:qt}},[qt]:{primaries:t,whitePoint:r,transfer:Xt,toXYZ:Wn,fromXYZ:Gn,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:qt}}}),e}var qn=Kn();function Jn(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Yn(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Xn,Zn=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Xn===void 0&&(Xn=rn(`canvas`)),Xn.width=e.width,Xn.height=e.height;let t=Xn.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Xn}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=rn(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Jn(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Jn(t[e]/255)*255):t[e]=Jn(t[e]);return{data:t,width:e.width,height:e.height}}return K(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Qn=0,$n=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Qn++}),this.uuid=_n(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(er(r[t].image)):e.push(er(r[t]))}else e=er(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function er(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Zn.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(K(`Texture: Unable to serialize Texture.`),{})}var tr=0,nr=new X,rr=class e extends fn{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=Ee,i=Ee,a=je,o=Ne,s=Ye,c=Pe,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:tr++}),this.uuid=_n(),this.name=``,this.source=new $n(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new Y(0,0),this.repeat=new Y(1,1),this.center=new Y(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Hn,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(nr).x}get height(){return this.source.getSize(nr).y}get depth(){return this.source.getSize(nr).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){K(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?K(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Te:e.x-=Math.floor(e.x);break;case Ee:e.x=e.x<0?0:1;break;case De:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case Te:e.y-=Math.floor(e.y);break;case Ee:e.y=e.y<0?0:1;break;case De:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};rr.DEFAULT_IMAGE=null,rr.DEFAULT_MAPPING=300,rr.DEFAULT_ANISOTROPY=1;var ir=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=vn(this.x,e.x,t.x),this.y=vn(this.y,e.y,t.y),this.z=vn(this.z,e.z,t.z),this.w=vn(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=vn(this.x,e,t),this.y=vn(this.y,e,t),this.z=vn(this.z,e,t),this.w=vn(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(vn(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ar=class extends fn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:je,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ir(0,0,e,t),this.scissorTest=!1,this.viewport=new ir(0,0,e,t),this.textures=[];let r=new rr({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:je,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new $n(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},or=class extends ar{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},sr=class extends rr{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Oe,this.minFilter=Oe,this.wrapR=Ee,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},cr=class extends rr{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Oe,this.minFilter=Oe,this.wrapR=Ee,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},lr=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/ur.setFromMatrixColumn(e,0).length(),i=1/ur.setFromMatrixColumn(e,1).length(),a=1/ur.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(fr,e,pr)}lookAt(e,t,n){let r=this.elements;return gr.subVectors(e,t),gr.lengthSq()===0&&(gr.z=1),gr.normalize(),mr.crossVectors(n,gr),mr.lengthSq()===0&&(Math.abs(n.z)===1?gr.x+=1e-4:gr.z+=1e-4,gr.normalize(),mr.crossVectors(n,gr)),mr.normalize(),hr.crossVectors(gr,mr),r[0]=mr.x,r[4]=hr.x,r[8]=gr.x,r[1]=mr.y,r[5]=hr.y,r[9]=gr.y,r[2]=mr.z,r[6]=hr.z,r[10]=gr.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],P=r[7],F=r[11],I=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*P,i[8]=a*C+o*D+s*j+c*F,i[12]=a*w+o*O+s*M+c*I,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*P,i[9]=l*C+u*D+d*j+f*F,i[13]=l*w+u*O+d*M+f*I,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*P,i[10]=p*C+m*D+h*j+g*F,i[14]=p*w+m*O+h*M+g*I,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*P,i[11]=_*C+v*D+y*j+b*F,i[15]=_*w+v*O+y*M+b*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=ur.set(r[0],r[1],r[2]).length(),o=ur.set(r[4],r[5],r[6]).length(),s=ur.set(r[8],r[9],r[10]).length();i<0&&(a=-a),dr.copy(this);let c=1/a,l=1/o,u=1/s;return dr.elements[0]*=c,dr.elements[1]*=c,dr.elements[2]*=c,dr.elements[4]*=l,dr.elements[5]*=l,dr.elements[6]*=l,dr.elements[8]*=u,dr.elements[9]*=u,dr.elements[10]*=u,t.setFromRotationMatrix(dr),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=en,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=en,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ur=new X,dr=new lr,fr=new X(0,0,0),pr=new X(1,1,1),mr=new X,hr=new X,gr=new X,_r=new lr,vr=new zn,yr=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(vn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-vn(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(vn(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-vn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(vn(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-vn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:K(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return _r.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_r,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return vr.setFromEuler(this),this.setFromQuaternion(vr,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};yr.DEFAULT_ORDER=`XYZ`;var br=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},xr=0,Sr=new X,Cr=new zn,wr=new lr,Tr=new X,Er=new X,Dr=new X,Or=new zn,kr=new X(1,0,0),Ar=new X(0,1,0),jr=new X(0,0,1),Mr={type:`added`},Nr={type:`removed`},Pr={type:`childadded`,child:null},Fr={type:`childremoved`,child:null},Ir=class e extends fn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xr++}),this.uuid=_n(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new X,n=new yr,r=new zn,i=new X(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new lr},normalMatrix:{value:new Hn}}),this.matrix=new lr,this.matrixWorld=new lr,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new br,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Cr.setFromAxisAngle(e,t),this.quaternion.multiply(Cr),this}rotateOnWorldAxis(e,t){return Cr.setFromAxisAngle(e,t),this.quaternion.premultiply(Cr),this}rotateX(e){return this.rotateOnAxis(kr,e)}rotateY(e){return this.rotateOnAxis(Ar,e)}rotateZ(e){return this.rotateOnAxis(jr,e)}translateOnAxis(e,t){return Sr.copy(e).applyQuaternion(this.quaternion),this.position.add(Sr.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(kr,e)}translateY(e){return this.translateOnAxis(Ar,e)}translateZ(e){return this.translateOnAxis(jr,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(wr.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Tr.copy(e):Tr.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Er.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wr.lookAt(Er,Tr,this.up):wr.lookAt(Tr,Er,this.up),this.quaternion.setFromRotationMatrix(wr),r&&(wr.extractRotation(r.matrixWorld),Cr.setFromRotationMatrix(wr),this.quaternion.premultiply(Cr.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(q(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Mr),Pr.child=e,this.dispatchEvent(Pr),Pr.child=null):q(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Nr),Fr.child=e,this.dispatchEvent(Fr),Fr.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),wr.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),wr.multiply(e.parent.matrixWorld)),e.applyMatrix4(wr),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Mr),Pr.child=e,this.dispatchEvent(Pr),Pr.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,e,Dr),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,Or,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Ir.DEFAULT_UP=new X(0,1,0),Ir.DEFAULT_MATRIX_AUTO_UPDATE=!0,Ir.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Lr=class extends Ir{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Rr={type:`move`},zr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Lr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Lr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new X,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new X),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Lr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new X,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new X,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Rr)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Lr;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Br={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vr={h:0,s:0,l:0},Hr={h:0,s:0,l:0};function Ur(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var Z=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qn.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=qn.workingColorSpace){return this.r=e,this.g=t,this.b=n,qn.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=qn.workingColorSpace){if(e=yn(e,1),t=vn(t,0,1),n=vn(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Ur(i,r,e+1/3),this.g=Ur(i,r,e),this.b=Ur(i,r,e-1/3)}return qn.colorSpaceToWorking(this,r),this}setStyle(e,t=qt){function n(t){t!==void 0&&parseFloat(t)<1&&K(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:K(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);K(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=qt){let n=Br[e.toLowerCase()];return n===void 0?K(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Jn(e.r),this.g=Jn(e.g),this.b=Jn(e.b),this}copyLinearToSRGB(e){return this.r=Yn(e.r),this.g=Yn(e.g),this.b=Yn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qt){return qn.workingToColorSpace(Wr.copy(this),e),Math.round(vn(Wr.r*255,0,255))*65536+Math.round(vn(Wr.g*255,0,255))*256+Math.round(vn(Wr.b*255,0,255))}getHexString(e=qt){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qn.workingColorSpace){qn.workingToColorSpace(Wr.copy(this),t);let n=Wr.r,r=Wr.g,i=Wr.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=qn.workingColorSpace){return qn.workingToColorSpace(Wr.copy(this),t),e.r=Wr.r,e.g=Wr.g,e.b=Wr.b,e}getStyle(e=qt){qn.workingToColorSpace(Wr.copy(this),e);let t=Wr.r,n=Wr.g,r=Wr.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Vr),this.setHSL(Vr.h+e,Vr.s+t,Vr.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Vr),e.getHSL(Hr);let n=Sn(Vr.h,Hr.h,t),r=Sn(Vr.s,Hr.s,t),i=Sn(Vr.l,Hr.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Wr=new Z;Z.NAMES=Br;var Gr=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new Z(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},Kr=class extends Ir{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new yr,this.environmentIntensity=1,this.environmentRotation=new yr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},qr=new X,Jr=new X,Yr=new X,Xr=new X,Zr=new X,Qr=new X,$r=new X,ei=new X,ti=new X,ni=new X,ri=new ir,ii=new ir,ai=new ir,oi=class e{constructor(e=new X,t=new X,n=new X){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),qr.subVectors(e,t),r.cross(qr);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){qr.subVectors(r,t),Jr.subVectors(n,t),Yr.subVectors(e,t);let a=qr.dot(qr),o=qr.dot(Jr),s=qr.dot(Yr),c=Jr.dot(Jr),l=Jr.dot(Yr),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Xr)!==null&&Xr.x>=0&&Xr.y>=0&&Xr.x+Xr.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Xr)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Xr.x),s.addScaledVector(a,Xr.y),s.addScaledVector(o,Xr.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return ri.setScalar(0),ii.setScalar(0),ai.setScalar(0),ri.fromBufferAttribute(e,t),ii.fromBufferAttribute(e,n),ai.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ri,i.x),a.addScaledVector(ii,i.y),a.addScaledVector(ai,i.z),a}static isFrontFacing(e,t,n,r){return qr.subVectors(n,t),Jr.subVectors(e,t),qr.cross(Jr).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qr.subVectors(this.c,this.b),Jr.subVectors(this.a,this.b),qr.cross(Jr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Zr.subVectors(r,n),Qr.subVectors(i,n),ei.subVectors(e,n);let s=Zr.dot(ei),c=Qr.dot(ei);if(s<=0&&c<=0)return t.copy(n);ti.subVectors(e,r);let l=Zr.dot(ti),u=Qr.dot(ti);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Zr,a);ni.subVectors(e,i);let f=Zr.dot(ni),p=Qr.dot(ni);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Qr,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return $r.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector($r,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Zr,a).addScaledVector(Qr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},si=class{constructor(e=new X(1/0,1/0,1/0),t=new X(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(li.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(li.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=li.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,li):li.fromBufferAttribute(r,t),li.applyMatrix4(e.matrixWorld),this.expandByPoint(li);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),ui.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),ui.copy(e.boundingBox)),ui.applyMatrix4(e.matrixWorld),this.union(ui)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,li),li.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_i),vi.subVectors(this.max,_i),di.subVectors(e.a,_i),fi.subVectors(e.b,_i),pi.subVectors(e.c,_i),mi.subVectors(fi,di),hi.subVectors(pi,fi),gi.subVectors(di,pi);let t=[0,-mi.z,mi.y,0,-hi.z,hi.y,0,-gi.z,gi.y,mi.z,0,-mi.x,hi.z,0,-hi.x,gi.z,0,-gi.x,-mi.y,mi.x,0,-hi.y,hi.x,0,-gi.y,gi.x,0];return!xi(t,di,fi,pi,vi)||(t=[1,0,0,0,1,0,0,0,1],!xi(t,di,fi,pi,vi))?!1:(yi.crossVectors(mi,hi),t=[yi.x,yi.y,yi.z],xi(t,di,fi,pi,vi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,li).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(li).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(ci[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ci[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ci[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ci[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ci[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ci[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ci[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ci[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ci)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ci=[new X,new X,new X,new X,new X,new X,new X,new X],li=new X,ui=new si,di=new X,fi=new X,pi=new X,mi=new X,hi=new X,gi=new X,_i=new X,vi=new X,yi=new X,bi=new X;function xi(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){bi.fromArray(e,a);let o=i.x*Math.abs(bi.x)+i.y*Math.abs(bi.y)+i.z*Math.abs(bi.z),s=t.dot(bi),c=n.dot(bi),l=r.dot(bi);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Si=new X,Ci=new Y,wi=0,Ti=class extends fn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wi++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Qt,this.updateRanges=[],this.gpuType=Be,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ci.fromBufferAttribute(this,t),Ci.applyMatrix3(e),this.setXY(t,Ci.x,Ci.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Si.fromBufferAttribute(this,t),Si.applyMatrix3(e),this.setXYZ(t,Si.x,Si.y,Si.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Si.fromBufferAttribute(this,t),Si.applyMatrix4(e),this.setXYZ(t,Si.x,Si.y,Si.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Si.fromBufferAttribute(this,t),Si.applyNormalMatrix(e),this.setXYZ(t,Si.x,Si.y,Si.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Si.fromBufferAttribute(this,t),Si.transformDirection(e),this.setXYZ(t,Si.x,Si.y,Si.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ln(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Rn(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ln(t,this.array)),t}setX(e,t){return this.normalized&&(t=Rn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ln(t,this.array)),t}setY(e,t){return this.normalized&&(t=Rn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ln(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Rn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ln(t,this.array)),t}setW(e,t){return this.normalized&&(t=Rn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Rn(t,this.array),n=Rn(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Rn(t,this.array),n=Rn(n,this.array),r=Rn(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Rn(t,this.array),n=Rn(n,this.array),r=Rn(r,this.array),i=Rn(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},Ei=class extends Ti{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Di=class extends Ti{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Oi=class extends Ti{constructor(e,t,n){super(new Float32Array(e),t,n)}},ki=new si,Ai=new X,ji=new X,Mi=class{constructor(e=new X,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?ki.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ai.subVectors(e,this.center);let t=Ai.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Ai,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ji.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ai.copy(e.center).add(ji)),this.expandByPoint(Ai.copy(e.center).sub(ji))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ni=0,Pi=new lr,Fi=new Ir,Ii=new X,Li=new si,Ri=new si,zi=new X,Bi=class e extends fn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ni++}),this.uuid=_n(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(tn(e)?Di:Ei)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new Hn().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Pi.makeRotationFromQuaternion(e),this.applyMatrix4(Pi),this}rotateX(e){return Pi.makeRotationX(e),this.applyMatrix4(Pi),this}rotateY(e){return Pi.makeRotationY(e),this.applyMatrix4(Pi),this}rotateZ(e){return Pi.makeRotationZ(e),this.applyMatrix4(Pi),this}translate(e,t,n){return Pi.makeTranslation(e,t,n),this.applyMatrix4(Pi),this}scale(e,t,n){return Pi.makeScale(e,t,n),this.applyMatrix4(Pi),this}lookAt(e){return Fi.lookAt(e),Fi.updateMatrix(),this.applyMatrix4(Fi.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ii).negate(),this.translate(Ii.x,Ii.y,Ii.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Oi(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&K(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new si);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)q(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new X(-1/0,-1/0,-1/0),new X(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Li.setFromBufferAttribute(n),this.morphTargetsRelative?(zi.addVectors(this.boundingBox.min,Li.min),this.boundingBox.expandByPoint(zi),zi.addVectors(this.boundingBox.max,Li.max),this.boundingBox.expandByPoint(zi)):(this.boundingBox.expandByPoint(Li.min),this.boundingBox.expandByPoint(Li.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&q(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)q(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new X,1/0);else if(e){let n=this.boundingSphere.center;if(Li.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ri.setFromBufferAttribute(n),this.morphTargetsRelative?(zi.addVectors(Li.min,Ri.min),Li.expandByPoint(zi),zi.addVectors(Li.max,Ri.max),Li.expandByPoint(zi)):(Li.expandByPoint(Ri.min),Li.expandByPoint(Ri.max))}Li.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)zi.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(zi));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)zi.fromBufferAttribute(a,t),o&&(Ii.fromBufferAttribute(e,t),zi.add(Ii)),r=Math.max(r,n.distanceToSquared(zi))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&q(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){q(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Ti(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new X,s[e]=new X;let c=new X,l=new X,u=new X,d=new Y,f=new Y,p=new Y,m=new X,h=new X;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new X,y=new X,b=new X,x=new X;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Ti(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new X,i=new X,a=new X,o=new X,s=new X,c=new X,l=new X,u=new X;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)zi.fromBufferAttribute(e,t),zi.normalize(),e.setXYZ(t,zi.x,zi.y,zi.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ti(a,r,i)}if(this.index===null)return K(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Vi=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Qt,this.updateRanges=[],this.version=0,this.uuid=_n()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=_n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=_n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Hi=new X,Ui=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Hi.fromBufferAttribute(this,t),Hi.applyMatrix4(e),this.setXYZ(t,Hi.x,Hi.y,Hi.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Hi.fromBufferAttribute(this,t),Hi.applyNormalMatrix(e),this.setXYZ(t,Hi.x,Hi.y,Hi.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Hi.fromBufferAttribute(this,t),Hi.transformDirection(e),this.setXYZ(t,Hi.x,Hi.y,Hi.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Ln(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Rn(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Rn(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Rn(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Rn(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Rn(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ln(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ln(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ln(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ln(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Rn(t,this.array),n=Rn(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Rn(t,this.array),n=Rn(n,this.array),r=Rn(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Rn(t,this.array),n=Rn(n,this.array),r=Rn(r,this.array),i=Rn(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){sn(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Ti(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){sn(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Wi=new X,Gi=new X,Ki=new Hn,qi=class{constructor(e=new X(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Wi.subVectors(n,t).cross(Gi.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Wi),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ki.getNormalMatrix(e),r=this.coplanarPoint(Wi).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Ji=0,Yi=class extends fn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ji++}),this.uuid=_n(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Z(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zt,this.stencilZFail=Zt,this.stencilZPass=Zt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){K(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?K(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Z().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new qi().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new Y().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Y().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Xi=class extends Yi{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new Z(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Zi,Qi=new X,$i=new X,ea=new X,ta=new Y,na=new Y,ra=new lr,ia=new X,aa=new X,oa=new X,sa=new Y,ca=new Y,la=new Y,ua=class extends Ir{constructor(e=new Xi){if(super(),this.isSprite=!0,this.type=`Sprite`,Zi===void 0){Zi=new Bi;let e=new Vi(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Zi.setIndex([0,1,2,0,2,3]),Zi.setAttribute(`position`,new Ui(e,3,0,!1)),Zi.setAttribute(`uv`,new Ui(e,2,3,!1))}this.geometry=Zi,this.material=e,this.center=new Y(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&q(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),$i.setFromMatrixScale(this.matrixWorld),ra.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ea.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&$i.multiplyScalar(-ea.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;da(ia.set(-.5,-.5,0),ea,a,$i,r,i),da(aa.set(.5,-.5,0),ea,a,$i,r,i),da(oa.set(.5,.5,0),ea,a,$i,r,i),sa.set(0,0),ca.set(1,0),la.set(1,1);let o=e.ray.intersectTriangle(ia,aa,oa,!1,Qi);if(o===null&&(da(aa.set(-.5,.5,0),ea,a,$i,r,i),ca.set(0,1),o=e.ray.intersectTriangle(ia,oa,aa,!1,Qi),o===null))return;let s=e.ray.origin.distanceTo(Qi);s<e.near||s>e.far||t.push({distance:s,point:Qi.clone(),uv:oi.getInterpolation(Qi,ia,aa,oa,sa,ca,la,new Y),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function da(e,t,n,r,i,a){ta.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?na.copy(ta):(na.x=a*ta.x-i*ta.y,na.y=i*ta.x+a*ta.y),e.copy(t),e.x+=na.x,e.y+=na.y,e.applyMatrix4(ra)}var fa=new X,pa=new X,ma=new X,ha=new X,ga=class{constructor(e=new X,t=new X(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,fa)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=fa.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(fa.copy(this.origin).addScaledVector(this.direction,t),fa.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){pa.copy(e).add(t).multiplyScalar(.5),ma.copy(t).sub(e).normalize(),ha.copy(this.origin).sub(pa);let i=e.distanceTo(t)*.5,a=-this.direction.dot(ma),o=ha.dot(this.direction),s=-ha.dot(ma),c=ha.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(pa).addScaledVector(ma,d),f}intersectSphere(e,t){if(e.radius<0)return null;fa.subVectors(e.center,this.origin);let n=fa.dot(this.direction),r=fa.dot(fa)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,fa)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,N;if(y>=b&&y>=x?(w=s,D=u,A=p,N=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,N=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,N=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let P=S/w,F=C/w,I=1/w,L=T-P*D,ee=E-F*D,te=O-P*A,ne=k-F*A,R=j-P*N,re=M-F*N,z=R*ne-re*te,ie=L*re-ee*R,ae=te*ee-ne*L;if(r){if(z<0||ie<0||ae<0)return null}else if((z<0||ie<0||ae<0)&&(z>0||ie>0||ae>0))return null;let oe=z+ie+ae;if(oe===0)return null;let B=I*(z*D+ie*A+ae*N);return(oe>0?B<0:B>0)?null:this.at(B/oe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_a=class extends Yi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new Z(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yr,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},va=new lr,ya=new ga,ba=new Mi,xa=new X,Sa=new X,Ca=new X,wa=new X,Ta=new X,Ea=new X,Da=new X,Oa=new X,Q=class extends Ir{constructor(e=new Bi,t=new _a){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Ea.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Ta.fromBufferAttribute(s,e),a?Ea.addScaledVector(Ta,r):Ea.addScaledVector(Ta.sub(t),r))}t.add(Ea)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ba.copy(n.boundingSphere),ba.applyMatrix4(i),ya.copy(e.ray).recast(e.near),!(ba.containsPoint(ya.origin)===!1&&(ya.intersectSphere(ba,xa)===null||ya.origin.distanceToSquared(xa)>(e.far-e.near)**2))&&(va.copy(i).invert(),ya.copy(e.ray).applyMatrix4(va),(n.boundingBox===null||ya.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,ya)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Aa(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Aa(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Aa(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Aa(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function ka(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Oa.copy(s),Oa.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Oa);return l<n.near||l>n.far?null:{distance:l,point:Oa.clone(),object:e}}function Aa(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Sa),e.getVertexPosition(c,Ca),e.getVertexPosition(l,wa);let u=ka(e,t,n,r,Sa,Ca,wa,Da);if(u){let e=new X;oi.getBarycoord(Da,Sa,Ca,wa,e),i&&(u.uv=oi.getInterpolatedAttribute(i,s,c,l,e,new Y)),a&&(u.uv1=oi.getInterpolatedAttribute(a,s,c,l,e,new Y)),o&&(u.normal=oi.getInterpolatedAttribute(o,s,c,l,e,new X),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new X,materialIndex:0};oi.getNormal(Sa,Ca,wa,t.normal),u.face=t,u.barycoord=e}return u}var ja=class extends rr{constructor(e=null,t=1,n=1,r,i,a,o,s,c=Oe,l=Oe,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ma=class extends Ti{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Na=new lr,Pa=new lr,Fa=[],Ia=new si,La=new lr,Ra=new Q,za=new Mi,Ba=class extends Q{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ma(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,La)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new si),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Na),Ia.copy(e.boundingBox).applyMatrix4(Na),this.boundingBox.union(Ia)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Mi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Na),za.copy(e.boundingSphere).applyMatrix4(Na),this.boundingSphere.union(za)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ra.geometry=this.geometry,Ra.material=this.material,Ra.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),za.copy(this.boundingSphere),za.applyMatrix4(n),e.ray.intersectsSphere(za)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Na),Pa.multiplyMatrices(n,Na),Ra.matrixWorld=Pa,Ra.raycast(e,Fa);for(let e=0,n=Fa.length;e<n;e++){let n=Fa[e];n.instanceId=i,n.object=this,t.push(n)}Fa.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Ma(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ja(new Float32Array(r*this.count),r,this.count,Qe,Be));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Va=new Mi,Ha=new Y(.5,.5),Ua=new X,Wa=class{constructor(e=new qi,t=new qi,n=new qi,r=new qi,i=new qi,a=new qi){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=en,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Va.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Va.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Va)}intersectsSprite(e){return Va.center.set(0,0,0),Va.radius=.7071067811865476+Ha.distanceTo(e.center),Va.applyMatrix4(e.matrixWorld),this.intersectsSphere(Va)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Ua.x=r.normal.x>0?e.max.x:e.min.x,Ua.y=r.normal.y>0?e.max.y:e.min.y,Ua.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ua)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Ga=class extends Yi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new Z(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Ka=new X,qa=new X,Ja=new lr,Ya=new ga,Xa=new Mi,Za=new X,Qa=new X,$a=class extends Ir{constructor(e=new Bi,t=new Ga){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Ka.fromBufferAttribute(t,e-1),qa.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Ka.distanceTo(qa);e.setAttribute(`lineDistance`,new Oi(n,1))}else K(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Xa.copy(n.boundingSphere),Xa.applyMatrix4(r),Xa.radius+=i,e.ray.intersectsSphere(Xa)===!1)return;Ja.copy(r).invert(),Ya.copy(e.ray).applyMatrix4(Ja);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=eo(this,e,Ya,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=eo(this,e,Ya,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=eo(this,e,Ya,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=eo(this,e,Ya,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function eo(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Ka.fromBufferAttribute(s,i),qa.fromBufferAttribute(s,a),n.distanceSqToSegment(Ka,qa,Za,Qa)>r)return;Za.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Za);if(!(c<t.near||c>t.far))return{distance:c,point:Qa.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var to=class extends Yi{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new Z(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},no=new lr,ro=new ga,io=new Mi,ao=new X,oo=class extends Ir{constructor(e=new Bi,t=new to){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),io.copy(n.boundingSphere),io.applyMatrix4(r),io.radius+=i,e.ray.intersectsSphere(io)===!1)return;no.copy(r).invert(),ro.copy(e.ray).applyMatrix4(no);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);ao.fromBufferAttribute(l,n),so(ao,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)ao.fromBufferAttribute(l,a),so(ao,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function so(e,t,n,r,i,a,o){let s=ro.distanceSqToPoint(e);if(s<n){let n=new X;ro.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var co=class extends rr{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},lo=class extends rr{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},uo=class extends rr{constructor(e,t,n=ze,r,i,a,o=Oe,s=Oe,c,l=Xe,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new $n(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},fo=class extends uo{constructor(e,t=ze,n=301,r,i,a=Oe,o=Oe,s,c=Xe){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},po=class extends rr{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},mo=class e extends Bi{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Oi(c,3)),this.setAttribute(`normal`,new Oi(l,3)),this.setAttribute(`uv`,new Oi(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new X;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},ho=class e extends Bi{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Oi(u,3)),this.setAttribute(`normal`,new Oi(d,3)),this.setAttribute(`uv`,new Oi(f,2));function _(){let a=new X,_=new X,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new Y,m=new X,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},go=class e extends ho{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},_o=class e extends Bi{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Oi(i,3)),this.setAttribute(`normal`,new Oi(i.slice(),3)),this.setAttribute(`uv`,new Oi(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new X,r=new X,i=new X;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new X;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new X;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new X,t=new X,n=new X,r=new X,o=new Y,s=new Y,c=new Y;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},vo=class e extends _o{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},yo=class e extends _o{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},bo=class e extends _o{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},xo=class e extends Bi{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Oi(p,3)),this.setAttribute(`normal`,new Oi(m,3)),this.setAttribute(`uv`,new Oi(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},So=class e extends Bi{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new X,p=new Y;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Oi(s,3)),this.setAttribute(`normal`,new Oi(c,3)),this.setAttribute(`uv`,new Oi(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Co=class e extends Bi{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new X,d=new X,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Oi(p,3)),this.setAttribute(`normal`,new Oi(m,3)),this.setAttribute(`uv`,new Oi(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},wo=class e extends _o{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type=`TetrahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},To=class e extends Bi{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new X,f=new X,p=new X;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new Oi(c,3)),this.setAttribute(`normal`,new Oi(l,3)),this.setAttribute(`uv`,new Oi(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Eo(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Oo(i))i.isRenderTargetTexture?(K(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Oo(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Do(e){let t={};for(let n=0;n<e.length;n++){let r=Eo(e[n]);for(let e in r)t[e]=r[e]}return t}function Oo(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function ko(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Ao(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:qn.workingColorSpace}var jo={clone:Eo,merge:Do},Mo=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,No=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Po=class extends Yi{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mo,this.fragmentShader=No,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Eo(e.uniforms),this.uniformsGroups=ko(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new Z().setHex(r.value);break;case`v2`:this.uniforms[n].value=new Y().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new X().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new ir().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new Hn().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new lr().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Fo=class extends Po{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Io=class extends Yi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new Z(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Z(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Y(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yr,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Lo=class extends Io{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Y(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return vn(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Z(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Z(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Z(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},Ro=class extends Yi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Kt,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},zo=class extends Yi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Bo(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Vo(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Ho=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Uo=class extends Ho{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ut,endingEnd:Ut}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Wt:i=e,o=2*t-n;break;case Gt:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Wt:a=e,s=2*n-t;break;case Gt:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Wo=class extends Ho{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Go=class extends Ho{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ko=class extends Ho{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Yo(n,t,g,y,r);i[p]=qo(x,o,_,b,m)}return i}};function qo(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Jo(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Yo(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=qo(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Jo(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Xo=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Bo(t,this.TimeBufferType),this.values=Bo(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Bo(e.times,Array),values:Bo(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Vo(e.settings)&&(n.settings={inTangents:Bo(e.settings.inTangents,Array),outTangents:Bo(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Go(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Uo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ko(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case zt:t=this.InterpolantFactoryMethodDiscrete;break;case Bt:t=this.InterpolantFactoryMethodLinear;break;case Vt:t=this.InterpolantFactoryMethodSmooth;break;case Ht:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return K(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zt;case this.InterpolantFactoryMethodLinear:return Bt;case this.InterpolantFactoryMethodSmooth:return Vt;case this.InterpolantFactoryMethodBezier:return Ht}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Vo(this.settings)&&(Zo(this.settings.inTangents,e),Zo(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(q(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(q(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){q(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){q(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&nn(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){q(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Vt,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Vo(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Zo(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Xo.prototype.ValueTypeName=``,Xo.prototype.TimeBufferType=Float32Array,Xo.prototype.ValueBufferType=Float32Array,Xo.prototype.DefaultInterpolation=Bt;var Qo=class extends Xo{constructor(e,t,n){super(e,t,n)}};Qo.prototype.ValueTypeName=`bool`,Qo.prototype.ValueBufferType=Array,Qo.prototype.DefaultInterpolation=zt,Qo.prototype.InterpolantFactoryMethodLinear=void 0,Qo.prototype.InterpolantFactoryMethodSmooth=void 0;var $o=class extends Xo{constructor(e,t,n,r){super(e,t,n,r)}};$o.prototype.ValueTypeName=`color`;var es=class extends Xo{constructor(e,t,n,r){super(e,t,n,r)}};es.prototype.ValueTypeName=`number`;var ts=class extends Ho{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)zn.slerpFlat(i,0,a,c-o,a,c,s);return i}},ns=class extends Xo{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ts(this.times,this.values,this.getValueSize(),e)}};ns.prototype.ValueTypeName=`quaternion`,ns.prototype.InterpolantFactoryMethodSmooth=void 0;var rs=class extends Xo{constructor(e,t,n){super(e,t,n)}};rs.prototype.ValueTypeName=`string`,rs.prototype.ValueBufferType=Array,rs.prototype.DefaultInterpolation=zt,rs.prototype.InterpolantFactoryMethodLinear=void 0,rs.prototype.InterpolantFactoryMethodSmooth=void 0;var is=class extends Xo{constructor(e,t,n,r){super(e,t,n,r)}};is.prototype.ValueTypeName=`vector`;var as=class extends Ir{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new Z(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},os=class extends as{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Ir.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Z(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},ss=new lr,cs=new X,ls=new X,us=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Y(512,512),this.mapType=Pe,this.map=null,this.mapPass=null,this.matrix=new lr,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Wa,this._frameExtents=new Y(1,1),this._viewportCount=1,this._viewports=[new ir(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;cs.setFromMatrixPosition(e.matrixWorld),t.position.copy(cs),ls.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ls),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){ss.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(ss,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(ss)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ds=new X,fs=new zn,ps=new X,ms=class extends Ir{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new lr,this.projectionMatrix=new lr,this.projectionMatrixInverse=new lr,this.coordinateSystem=en,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ds,fs,ps),ps.x===1&&ps.y===1&&ps.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ds,fs,ps.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ds,fs,ps),ps.x===1&&ps.y===1&&ps.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ds,fs,ps.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},hs=new X,gs=new Y,_s=new Y,vs=class extends ms{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=gn*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(hn*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gn*2*Math.atan(Math.tan(hn*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){hs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(hs.x,hs.y).multiplyScalar(-e/hs.z),hs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(hs.x,hs.y).multiplyScalar(-e/hs.z)}getViewSize(e,t){return this.getViewBounds(e,gs,_s),t.subVectors(_s,gs)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(hn*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ys=class extends us{constructor(){super(new vs(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=gn*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},bs=class extends as{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(Ir.DEFAULT_UP),this.updateMatrix(),this.target=new Ir,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new ys}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},xs=class extends us{constructor(){super(new vs(90,1,.5,500)),this.isPointLightShadow=!0}},Ss=class extends as{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new xs}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Cs=class extends ms{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ws=class extends us{constructor(){super(new Cs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ts=class extends as{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Ir.DEFAULT_UP),this.updateMatrix(),this.target=new Ir,this.shadow=new ws}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Es=-90,Ds=1,Os=class extends Ir{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new vs(Es,Ds,e,t);r.layers=this.layers,this.add(r);let i=new vs(Es,Ds,e,t);i.layers=this.layers,this.add(i);let a=new vs(Es,Ds,e,t);a.layers=this.layers,this.add(a);let o=new vs(Es,Ds,e,t);o.layers=this.layers,this.add(o);let s=new vs(Es,Ds,e,t);s.layers=this.layers,this.add(s);let c=new vs(Es,Ds,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},ks=class extends vs{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},As=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=js.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function js(){this._document.hidden===!1&&this.reset()}var Ms=`\\[\\]\\.:\\/`,Ns=RegExp(`[\\[\\]\\.:\\/]`,`g`),Ps=`[^\\[\\]\\.:\\/]`,Fs=`[^`+Ms.replace(`\\.`,``)+`]`,Is=`((?:WC+[\\/:])*)`.replace(`WC`,Ps),Ls=`(WCOD+)?`.replace(`WCOD`,Fs),Rs=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Ps),zs=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Ps),Bs=RegExp(`^`+Is+Ls+Rs+zs+`$`),Vs=[`material`,`materials`,`bones`,`map`],Hs=class{constructor(e,t,n){let r=n||Us.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Us=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Ns,``)}static parseTrackName(e){let t=Bs.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Vs.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){K(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){q(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){q(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){q(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){q(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){q(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){q(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){q(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;q(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){q(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){q(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Us.Composite=Hs,Us.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Us.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Us.prototype.GetterByBindingType=[Us.prototype._getValue_direct,Us.prototype._getValue_array,Us.prototype._getValue_arrayElement,Us.prototype._getValue_toArray],Us.prototype.SetterByBindingTypeAndVersioning=[[Us.prototype._setValue_direct,Us.prototype._setValue_direct_setNeedsUpdate,Us.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Us.prototype._setValue_array,Us.prototype._setValue_array_setNeedsUpdate,Us.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Us.prototype._setValue_arrayElement,Us.prototype._setValue_arrayElement_setNeedsUpdate,Us.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Us.prototype._setValue_fromArray,Us.prototype._setValue_fromArray_setNeedsUpdate,Us.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Ws=new lr,Gs=class{constructor(e,t,n=0,r=1/0){this.ray=new ga(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new br,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):q(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Ws.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ws),this}intersectObject(e,t=!0,n=[]){return qs(e,this,n,t),n.sort(Ks),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)qs(e[r],this,n,t);return n.sort(Ks),n}};function Ks(e,t){return e.distance-t.distance}function qs(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)qs(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function Js(e,t,n,r){let i=Ys(r);switch(n){case qe:return e*t;case Qe:return e*t/i.components*i.byteLength;case $e:return e*t/i.components*i.byteLength;case et:return e*t*2/i.components*i.byteLength;case tt:return e*t*2/i.components*i.byteLength;case Je:return e*t*3/i.components*i.byteLength;case Ye:return e*t*4/i.components*i.byteLength;case nt:return e*t*4/i.components*i.byteLength;case rt:case it:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case at:case ot:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ct:case ut:return Math.max(e,16)*Math.max(t,8)/4;case st:case lt:return Math.max(e,8)*Math.max(t,8)/2;case dt:case ft:case mt:case ht:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case pt:case gt:case _t:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case vt:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case yt:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case bt:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case xt:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case St:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Ct:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case wt:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Tt:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Et:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Dt:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Ot:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case kt:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case At:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case jt:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Mt:case Nt:case Pt:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ft:case It:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Lt:case Rt:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ys(e){switch(e){case Pe:case Fe:return{byteLength:1,components:1};case Le:case Ie:case Ve:return{byteLength:2,components:1};case He:case Ue:return{byteLength:2,components:4};case ze:case Re:case Be:return{byteLength:4,components:1};case Ge:case Ke:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?K(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function Xs(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Zs(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Qs={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},$={common:{diffuse:{value:new Z(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Hn},alphaMap:{value:null},alphaMapTransform:{value:new Hn},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Hn}},envmap:{envMap:{value:null},envMapRotation:{value:new Hn},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Hn}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Hn}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Hn},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Hn},normalScale:{value:new Y(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Hn},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Hn}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Hn}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Hn}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Z(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new X},probesMax:{value:new X},probesResolution:{value:new X}},points:{diffuse:{value:new Z(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Hn},alphaTest:{value:0},uvTransform:{value:new Hn}},sprite:{diffuse:{value:new Z(16777215)},opacity:{value:1},center:{value:new Y(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Hn},alphaMap:{value:null},alphaMapTransform:{value:new Hn},alphaTest:{value:0}}},$s={basic:{uniforms:Do([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.fog]),vertexShader:Qs.meshbasic_vert,fragmentShader:Qs.meshbasic_frag},lambert:{uniforms:Do([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:new Z(0)},envMapIntensity:{value:1}}]),vertexShader:Qs.meshlambert_vert,fragmentShader:Qs.meshlambert_frag},phong:{uniforms:Do([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:new Z(0)},specular:{value:new Z(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Qs.meshphong_vert,fragmentShader:Qs.meshphong_frag},standard:{uniforms:Do([$.common,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.roughnessmap,$.metalnessmap,$.fog,$.lights,{emissive:{value:new Z(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qs.meshphysical_vert,fragmentShader:Qs.meshphysical_frag},toon:{uniforms:Do([$.common,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.gradientmap,$.fog,$.lights,{emissive:{value:new Z(0)}}]),vertexShader:Qs.meshtoon_vert,fragmentShader:Qs.meshtoon_frag},matcap:{uniforms:Do([$.common,$.bumpmap,$.normalmap,$.displacementmap,$.fog,{matcap:{value:null}}]),vertexShader:Qs.meshmatcap_vert,fragmentShader:Qs.meshmatcap_frag},points:{uniforms:Do([$.points,$.fog]),vertexShader:Qs.points_vert,fragmentShader:Qs.points_frag},dashed:{uniforms:Do([$.common,$.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qs.linedashed_vert,fragmentShader:Qs.linedashed_frag},depth:{uniforms:Do([$.common,$.displacementmap]),vertexShader:Qs.depth_vert,fragmentShader:Qs.depth_frag},normal:{uniforms:Do([$.common,$.bumpmap,$.normalmap,$.displacementmap,{opacity:{value:1}}]),vertexShader:Qs.meshnormal_vert,fragmentShader:Qs.meshnormal_frag},sprite:{uniforms:Do([$.sprite,$.fog]),vertexShader:Qs.sprite_vert,fragmentShader:Qs.sprite_frag},background:{uniforms:{uvTransform:{value:new Hn},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qs.background_vert,fragmentShader:Qs.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Hn}},vertexShader:Qs.backgroundCube_vert,fragmentShader:Qs.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qs.cube_vert,fragmentShader:Qs.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qs.equirect_vert,fragmentShader:Qs.equirect_frag},distance:{uniforms:Do([$.common,$.displacementmap,{referencePosition:{value:new X},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qs.distance_vert,fragmentShader:Qs.distance_frag},shadow:{uniforms:Do([$.lights,$.fog,{color:{value:new Z(0)},opacity:{value:1}}]),vertexShader:Qs.shadow_vert,fragmentShader:Qs.shadow_frag}};$s.physical={uniforms:Do([$s.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Hn},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Hn},clearcoatNormalScale:{value:new Y(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Hn},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Hn},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Hn},sheen:{value:0},sheenColor:{value:new Z(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Hn},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Hn},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Hn},transmissionSamplerSize:{value:new Y},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Hn},attenuationDistance:{value:0},attenuationColor:{value:new Z(0)},specularColor:{value:new Z(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Hn},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Hn},anisotropyVector:{value:new Y},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Hn}}]),vertexShader:Qs.meshphysical_vert,fragmentShader:Qs.meshphysical_frag};var ec={r:0,b:0,g:0},tc=new lr,nc=new Hn;nc.set(-1,0,0,0,1,0,0,0,1);function rc(e,t,n,r,i,a){let o=new Z(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new Q(new mo(1,1,1),new Po({name:`BackgroundCubeMaterial`,uniforms:Eo($s.backgroundCube.uniforms),vertexShader:$s.backgroundCube.vertexShader,fragmentShader:$s.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(tc.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(nc),l.material.toneMapped=qn.getTransfer(i.colorSpace)!==Xt,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new Q(new xo(2,2),new Po({name:`BackgroundMaterial`,uniforms:Eo($s.background.uniforms),vertexShader:$s.background.vertexShader,fragmentShader:$s.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=qn.getTransfer(i.colorSpace)!==Xt,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(ec,Ao(e)),n.buffers.color.setClear(ec.r,ec.g,ec.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function ic(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function ac(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function oc(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(K(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&K(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function sc(e){let t=this,n=null,r=0,i=!1,a=!1,o=new qi,s=new Hn,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var cc=4,lc=6,uc=20,dc=256,fc=new Cs,pc=new Z,mc=null,hc=0,gc=0,_c=!1,vc=new X,yc=new X,bc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=vc}=i;mc=this._renderer.getRenderTarget(),hc=this._renderer.getActiveCubeFace(),gc=this._renderer.getActiveMipmapLevel(),_c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Dc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ec(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(mc,hc,gc),this._renderer.xr.enabled=_c,e.scissorTest=!1,Cc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),mc=this._renderer.getRenderTarget(),hc=this._renderer.getActiveCubeFace(),gc=this._renderer.getActiveMipmapLevel(),_c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:je,minFilter:je,generateMipmaps:!1,type:Ve,format:Ye,colorSpace:Jt,depthBuffer:!1},r=Sc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Sc(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=xc(r)),this._blurMaterial=Tc(r,e,t),this._ggxMaterial=wc(r,e,t)}return r}_compileMaterial(e){let t=new Q(new Bi,e);this._renderer.compile(t,fc)}_sceneToCubeUV(e,t,n,r,i){let a=new vs(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(pc),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Q(new mo,new _a({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(pc),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Cc(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Dc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ec());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Cc(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,fc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-cc?n-d+cc:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Cc(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,fc),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Cc(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,fc)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];Cc(t,3*l*(r>this._lodMax-cc?r-this._lodMax+cc:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,fc)}};function xc(e){let t=[],n=[],r=e,i=e-cc+1+lc;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?yc.set(1,r,n):e===1?yc.set(-n,1,-r):e===2?yc.set(-n,r,1):e===3?yc.set(-1,r,-n):e===4?yc.set(-n,-1,r):yc.set(n,r,-1),yc.toArray(l,(e*6+t)*3)}}let u=new Bi;u.setAttribute(`position`,new Ti(c,3)),u.setAttribute(`outputDirection`,new Ti(l,3)),n.push(new Q(u,null)),r>cc&&r--}return{lodMeshes:n,sizeLods:t}}function Sc(e,t,n){let r=new or(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Cc(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function wc(e,t,n){return new Po({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:dc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Oc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Tc(e,t,n){return new Po({name:`SphericalGaussianBlur`,defines:{SAMPLES:uc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Oc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ec(){return new Po({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Oc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Dc(){return new Po({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Oc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Oc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var kc=class extends or{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new co(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new mo(5,5,5),i=new Po({name:`CubemapFromEquirect`,uniforms:Eo(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Q(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=je),new Os(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Ac(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new kc(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new bc(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new bc(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function jc(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&ln(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Mc(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?Di:Ei)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Nc(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Pc(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:q(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Fc(e,t,n){let r=new WeakMap,i=new ir;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new sr(h,p,m,u);g.type=Be,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new Y(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ic(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Lc={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Rc(e,t,n,r,i,a){let o=new or(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Bi;l.setAttribute(`position`,new Oi([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new Oi([0,2,0,0,2,0],2));let u=new Fo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Q(l,u),f=new Cs(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,_=null,v=[],y=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,y=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;v.length>0&&s===null&&(s=new or(t,n,{type:Ve,depthBuffer:!1,stencilBuffer:!1}),c=new or(t,n,{type:Ve,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return y===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return y},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},qn.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=Lc[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(d,f),_=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var zc=new rr,Bc=new uo(1,1),Vc=new sr,Hc=new cr,Uc=new co,Wc=[],Gc=[],Kc=new Float32Array(16),qc=new Float32Array(9),Jc=new Float32Array(4);function Yc(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Wc[i];if(a===void 0&&(a=new Float32Array(i),Wc[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Xc(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Zc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Qc(e,t){let n=Gc[t];n===void 0&&(n=new Int32Array(t),Gc[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function $c(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function el(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xc(n,t))return;e.uniform2fv(this.addr,t),Zc(n,t)}}function tl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Xc(n,t))return;e.uniform3fv(this.addr,t),Zc(n,t)}}function nl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xc(n,t))return;e.uniform4fv(this.addr,t),Zc(n,t)}}function rl(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xc(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Zc(n,t)}else{if(Xc(n,r))return;Jc.set(r),e.uniformMatrix2fv(this.addr,!1,Jc),Zc(n,r)}}function il(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xc(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Zc(n,t)}else{if(Xc(n,r))return;qc.set(r),e.uniformMatrix3fv(this.addr,!1,qc),Zc(n,r)}}function al(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xc(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Zc(n,t)}else{if(Xc(n,r))return;Kc.set(r),e.uniformMatrix4fv(this.addr,!1,Kc),Zc(n,r)}}function ol(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function sl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xc(n,t))return;e.uniform2iv(this.addr,t),Zc(n,t)}}function cl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xc(n,t))return;e.uniform3iv(this.addr,t),Zc(n,t)}}function ll(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xc(n,t))return;e.uniform4iv(this.addr,t),Zc(n,t)}}function ul(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function dl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xc(n,t))return;e.uniform2uiv(this.addr,t),Zc(n,t)}}function fl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xc(n,t))return;e.uniform3uiv(this.addr,t),Zc(n,t)}}function pl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xc(n,t))return;e.uniform4uiv(this.addr,t),Zc(n,t)}}function ml(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Bc.compareFunction=n.isReversedDepthBuffer()?518:515,a=Bc):a=zc,n.setTexture2D(t||a,i)}function hl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Hc,i)}function gl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Uc,i)}function _l(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Vc,i)}function vl(e){switch(e){case 5126:return $c;case 35664:return el;case 35665:return tl;case 35666:return nl;case 35674:return rl;case 35675:return il;case 35676:return al;case 5124:case 35670:return ol;case 35667:case 35671:return sl;case 35668:case 35672:return cl;case 35669:case 35673:return ll;case 5125:return ul;case 36294:return dl;case 36295:return fl;case 36296:return pl;case 35678:case 36198:case 36298:case 36306:case 35682:return ml;case 35679:case 36299:case 36307:return hl;case 35680:case 36300:case 36308:case 36293:return gl;case 36289:case 36303:case 36311:case 36292:return _l}}function yl(e,t){e.uniform1fv(this.addr,t)}function bl(e,t){let n=Yc(t,this.size,2);e.uniform2fv(this.addr,n)}function xl(e,t){let n=Yc(t,this.size,3);e.uniform3fv(this.addr,n)}function Sl(e,t){let n=Yc(t,this.size,4);e.uniform4fv(this.addr,n)}function Cl(e,t){let n=Yc(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function wl(e,t){let n=Yc(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Tl(e,t){let n=Yc(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function El(e,t){e.uniform1iv(this.addr,t)}function Dl(e,t){e.uniform2iv(this.addr,t)}function Ol(e,t){e.uniform3iv(this.addr,t)}function kl(e,t){e.uniform4iv(this.addr,t)}function Al(e,t){e.uniform1uiv(this.addr,t)}function jl(e,t){e.uniform2uiv(this.addr,t)}function Ml(e,t){e.uniform3uiv(this.addr,t)}function Nl(e,t){e.uniform4uiv(this.addr,t)}function Pl(e,t,n){let r=this.cache,i=t.length,a=Qc(n,i);Xc(r,a)||(e.uniform1iv(this.addr,a),Zc(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Bc:zc;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Fl(e,t,n){let r=this.cache,i=t.length,a=Qc(n,i);Xc(r,a)||(e.uniform1iv(this.addr,a),Zc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Hc,a[e])}function Il(e,t,n){let r=this.cache,i=t.length,a=Qc(n,i);Xc(r,a)||(e.uniform1iv(this.addr,a),Zc(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Uc,a[e])}function Ll(e,t,n){let r=this.cache,i=t.length,a=Qc(n,i);Xc(r,a)||(e.uniform1iv(this.addr,a),Zc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Vc,a[e])}function Rl(e){switch(e){case 5126:return yl;case 35664:return bl;case 35665:return xl;case 35666:return Sl;case 35674:return Cl;case 35675:return wl;case 35676:return Tl;case 5124:case 35670:return El;case 35667:case 35671:return Dl;case 35668:case 35672:return Ol;case 35669:case 35673:return kl;case 5125:return Al;case 36294:return jl;case 36295:return Ml;case 36296:return Nl;case 35678:case 36198:case 36298:case 36306:case 35682:return Pl;case 35679:case 36299:case 36307:return Fl;case 35680:case 36300:case 36308:case 36293:return Il;case 36289:case 36303:case 36311:case 36292:return Ll}}var zl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=vl(t.type)}},Bl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Rl(t.type)}},Vl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Hl=/(\w+)(\])?(\[|\.)?/g;function Ul(e,t){e.seq.push(t),e.map[t.id]=t}function Wl(e,t,n){let r=e.name,i=r.length;for(Hl.lastIndex=0;;){let a=Hl.exec(r),o=Hl.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Ul(n,l===void 0?new zl(s,e,t):new Bl(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Vl(s),Ul(n,e)),n=e}}}var Gl=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Wl(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Kl(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var ql=37297,Jl=0;function Yl(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Xl=new Hn;function Zl(e){qn._getMatrix(Xl,qn.workingColorSpace,e);let t=`mat3( ${Xl.elements.map(e=>e.toFixed(4))} )`;switch(qn.getTransfer(e)){case Yt:return[t,`LinearTransferOETF`];case Xt:return[t,`sRGBTransferOETF`];default:return K(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Ql(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Yl(e.getShaderSource(t),r)}return i}function $l(e,t){let n=Zl(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var eu={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function tu(e,t){let n=eu[t];return n===void 0?(K(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var nu=new X;function ru(){return qn.getLuminanceCoefficients(nu),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${nu.x.toFixed(4)}, ${nu.y.toFixed(4)}, ${nu.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function iu(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(su).join(`
`)}function au(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function ou(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function su(e){return e!==``}function cu(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function lu(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var uu=/^[ \t]*#include +<([\w\d./]+)>/gm;function du(e){return e.replace(uu,pu)}var fu=new Map;function pu(e,t){let n=Qs[t];if(n===void 0){let e=fu.get(t);if(e!==void 0)n=Qs[e],K(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return du(n)}var mu=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hu(e){return e.replace(mu,gu)}function gu(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function _u(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var vu={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function yu(e){return vu[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var bu={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function xu(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:bu[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var Su={302:`ENVMAP_MODE_REFRACTION`};function Cu(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Su[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var wu={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Tu(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:wu[e.combine]||`ENVMAP_BLENDING_NONE`}function Eu(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Du(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=yu(n),l=xu(n),u=Cu(n),d=Tu(n),f=Eu(n),p=iu(n),m=au(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(su).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(su).join(`
`),_.length>0&&(_+=`
`)):(g=[_u(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(su).join(`
`),_=[_u(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Qs.tonemapping_pars_fragment,n.toneMapping===0?``:tu(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Qs.colorspace_pars_fragment,$l(`linearToOutputTexel`,n.outputColorSpace),ru(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(su).join(`
`)),o=du(o),o=cu(o,n),o=lu(o,n),s=du(s),s=cu(s,n),s=lu(s,n),o=hu(o),s=hu(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Kl(i,i.VERTEX_SHADER,y),S=Kl(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Ql(i,x,`vertex`),n=Ql(i,S,`fragment`);q(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):K(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Gl(i,h),T=ou(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,ql)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Jl++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Ou=0,ku=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Au(e),t.set(e,n)),n}},Au=class{constructor(e){this.id=Ou++,this.code=e,this.usedTimes=0}};function ju(e){return e===1030||e===37490||e===36285}function Mu(e,t,n,r,i,a){let o=new br,s=new ku,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&K(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=$s[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),M=e.state.buffers.depth.getReversed(),N=h.isInstancedMesh===!0,P=h.isBatchedMesh===!0,F=!!i.map,I=!!i.matcap,L=!!x,ee=!!i.aoMap,te=!!i.lightMap,ne=!!i.bumpMap&&i.wireframe===!1,R=!!i.normalMap,re=!!i.displacementMap,z=!!i.emissiveMap,ie=!!i.metalnessMap,ae=!!i.roughnessMap,oe=i.anisotropy>0,B=i.clearcoat>0,se=i.dispersion>0,ce=i.retroreflectivity>0,le=i.iridescence>0,ue=i.sheen>0,de=i.transmission>0,fe=oe&&!!i.anisotropyMap,pe=B&&!!i.clearcoatMap,me=B&&!!i.clearcoatNormalMap,he=B&&!!i.clearcoatRoughnessMap,ge=le&&!!i.iridescenceMap,V=le&&!!i.iridescenceThicknessMap,_e=ue&&!!i.sheenColorMap,ve=ue&&!!i.sheenRoughnessMap,ye=!!i.specularMap,H=!!i.specularColorMap,U=!!i.specularIntensityMap,W=de&&!!i.transmissionMap,G=de&&!!i.thicknessMap,be=!!i.gradientMap,xe=!!i.alphaMap,Se=i.alphaTest>0,Ce=!!i.alphaHash,we=!!i.extensions,Te=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Te=e.toneMapping);let Ee={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:P,batchingColor:P&&h._colorsTexture!==null,instancing:N,instancingColor:N&&h.instanceColor!==null,instancingMorph:N&&h.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:qn.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:F,matcap:I,envMap:L,envMapMode:L&&x.mapping,envMapCubeUVHeight:S,aoMap:ee,lightMap:te,bumpMap:ne,normalMap:R,displacementMap:re,emissiveMap:z,normalMapObjectSpace:R&&i.normalMapType===1,normalMapTangentSpace:R&&i.normalMapType===0,packedNormalMap:R&&i.normalMapType===0&&ju(i.normalMap.format),metalnessMap:ie,roughnessMap:ae,anisotropy:oe,anisotropyMap:fe,clearcoat:B,clearcoatMap:pe,clearcoatNormalMap:me,clearcoatRoughnessMap:he,dispersion:se,retroreflection:ce,iridescence:le,iridescenceMap:ge,iridescenceThicknessMap:V,sheen:ue,sheenColorMap:_e,sheenRoughnessMap:ve,specularMap:ye,specularColorMap:H,specularIntensityMap:U,transmission:de,transmissionMap:W,thicknessMap:G,gradientMap:be,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:xe,alphaTest:Se,alphaHash:Ce,combine:i.combine,mapUv:F&&m(i.map.channel),aoMapUv:ee&&m(i.aoMap.channel),lightMapUv:te&&m(i.lightMap.channel),bumpMapUv:ne&&m(i.bumpMap.channel),normalMapUv:R&&m(i.normalMap.channel),displacementMapUv:re&&m(i.displacementMap.channel),emissiveMapUv:z&&m(i.emissiveMap.channel),metalnessMapUv:ie&&m(i.metalnessMap.channel),roughnessMapUv:ae&&m(i.roughnessMap.channel),anisotropyMapUv:fe&&m(i.anisotropyMap.channel),clearcoatMapUv:pe&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:me&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:he&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:ge&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:V&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:ve&&m(i.sheenRoughnessMap.channel),specularMapUv:ye&&m(i.specularMap.channel),specularColorMapUv:H&&m(i.specularColorMap.channel),specularIntensityMapUv:U&&m(i.specularIntensityMap.channel),transmissionMapUv:W&&m(i.transmissionMap.channel),thicknessMapUv:G&&m(i.thicknessMap.channel),alphaMapUv:xe&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(R||oe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(F||xe),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&R===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:M,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Te,decodeVideoTexture:F&&i.map.isVideoTexture===!0&&qn.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:z&&i.emissiveMap.isVideoTexture===!0&&qn.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:we&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(we&&i.extensions.multiDraw===!0||P)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ee.vertexUv1s=c.has(1),Ee.vertexUv2s=c.has(2),Ee.vertexUv3s=c.has(3),c.clear(),Ee}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=$s[t];n=jo.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Du(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function Nu(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Pu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Fu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Iu(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Pu),r.length>1&&r.sort(t||Fu),i.length>1&&i.sort(t||Fu)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Lu(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Iu,e.set(t,[i])):n>=r.length?(i=new Iu,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ru(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new X,color:new Z};break;case`SpotLight`:n={position:new X,direction:new X,color:new Z,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new X,color:new Z,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new X,skyColor:new Z,groundColor:new Z};break;case`RectAreaLight`:n={color:new Z,position:new X,halfWidth:new X,halfHeight:new X}}return e[t.id]=n,n}}}function zu(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Y};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Y};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Y,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Bu=0;function Vu(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Hu(e){let t=new Ru,n=zu(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new X);let i=new X,a=new lr,o=new lr;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Vu);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=$.LTC_FLOAT_1,r.rectAreaLTC2=$.LTC_FLOAT_2):(r.rectAreaLTC1=$.LTC_HALF_1,r.rectAreaLTC2=$.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Bu++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Uu(e){let t=new Hu(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Wu(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Uu(e),t.set(n,[a])):r>=i.length?(a=new Uu(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Gu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ku=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,qu=[new X(1,0,0),new X(-1,0,0),new X(0,1,0),new X(0,-1,0),new X(0,0,1),new X(0,0,-1)],Ju=[new X(0,-1,0),new X(0,-1,0),new X(0,0,1),new X(0,0,-1),new X(0,-1,0),new X(0,-1,0)],Yu=new lr,Xu=new X,Zu=new X;function Qu(e,t,n){let r=new Wa,i=new Y,a=new Y,o=new ir,s=new Ro,c=new zo,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Po({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Y},radius:{value:4}},vertexShader:Gu,fragmentShader:Ku}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Bi;m.setAttribute(`position`,new Ti(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new Q(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(K(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){K(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){K(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new or(i.x,i.y,{format:et,type:Ve,minFilter:je,magFilter:je,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new uo(i.x,i.y,Be),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Xe,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Oe,d.map.depthTexture.magFilter=Oe}else l.isPointLight?(d.map=new kc(i.x),d.map.depthTexture=new fo(i.x,ze)):(d.map=new or(i.x,i.y),d.map.depthTexture=new uo(i.x,i.y,ze)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Xe,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=je,d.map.depthTexture.magFilter=je):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Oe,d.map.depthTexture.magFilter=Oe);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Xu.setFromMatrixPosition(l.matrixWorld),e.position.copy(Xu),Zu.copy(e.position),Zu.add(qu[t]),e.up.copy(Ju[t]),e.lookAt(Zu),e.updateMatrixWorld(),n.makeTranslation(-Xu.x,-Xu.y,-Xu.z),Yu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(Yu,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new or(i.x,i.y,{format:et,type:Ve}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function $u(e,t){function n(){let t=!1,n=new ir,r=null,i=new ir(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ie(e.DEPTH_TEST):ae(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=dn[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ie(e.STENCIL_TEST):ae(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,P=0,F=e.getParameter(e.VERSION);F.indexOf(`WebGL`)===-1?F.indexOf(`OpenGL ES`)!==-1&&(P=parseFloat(/^OpenGL ES (\d)/.exec(F)[1]),N=P>=2):(P=parseFloat(/^WebGL (\d)/.exec(F)[1]),N=P>=1);let I=null,L={},ee=e.getParameter(e.SCISSOR_BOX),te=e.getParameter(e.VIEWPORT),ne=new ir().fromArray(ee),R=new ir().fromArray(te);function re(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let z={};z[e.TEXTURE_2D]=re(e.TEXTURE_2D,e.TEXTURE_2D,1),z[e.TEXTURE_CUBE_MAP]=re(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),z[e.TEXTURE_2D_ARRAY]=re(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),z[e.TEXTURE_3D]=re(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ie(e.DEPTH_TEST),o.setFunc(3),fe(!1),pe(1),ie(e.CULL_FACE),ue(0);function ie(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ae(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function oe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function B(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function se(t){return h!==t&&(e.useProgram(t),h=t,!0)}let ce={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ce[103]=e.MIN,ce[104]=e.MAX;let le={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ue(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(ae(e.BLEND),g=!1);else if(g===!1&&(ie(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:q(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:q(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:q(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:q(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(ce[n],ce[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(le[r],le[i],le[o],le[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function de(t,n){t.side===2?ae(e.CULL_FACE):ie(e.CULL_FACE);let r=t.side===1;n&&(r=!r),fe(r),t.blending===1&&t.transparent===!1?ue(0):ue(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),he(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ie(e.SAMPLE_ALPHA_TO_COVERAGE):ae(e.SAMPLE_ALPHA_TO_COVERAGE)}function fe(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function pe(t){t===0?ae(e.CULL_FACE):(ie(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function me(t){t!==k&&(N&&e.lineWidth(t),k=t)}function he(t,n,r){t?(ie(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):ae(e.POLYGON_OFFSET_FILL)}function ge(t){t?ie(e.SCISSOR_TEST):ae(e.SCISSOR_TEST)}function V(t){t===void 0&&(t=e.TEXTURE0+M-1),I!==t&&(e.activeTexture(t),I=t)}function _e(t,n,r){r===void 0&&(r=I===null?e.TEXTURE0+M-1:I);let i=L[r];i===void 0&&(i={type:void 0,texture:void 0},L[r]=i),(i.type!==t||i.texture!==n)&&(I!==r&&(e.activeTexture(r),I=r),e.bindTexture(t,n||z[t]),i.type=t,i.texture=n)}function ve(){let t=L[I];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function ye(){try{e.compressedTexImage2D(...arguments)}catch(e){q(`WebGLState:`,e)}}function H(){try{e.compressedTexImage3D(...arguments)}catch(e){q(`WebGLState:`,e)}}function U(){try{e.texSubImage2D(...arguments)}catch(e){q(`WebGLState:`,e)}}function W(){try{e.texSubImage3D(...arguments)}catch(e){q(`WebGLState:`,e)}}function G(){try{e.compressedTexSubImage2D(...arguments)}catch(e){q(`WebGLState:`,e)}}function be(){try{e.compressedTexSubImage3D(...arguments)}catch(e){q(`WebGLState:`,e)}}function xe(){try{e.texStorage2D(...arguments)}catch(e){q(`WebGLState:`,e)}}function Se(){try{e.texStorage3D(...arguments)}catch(e){q(`WebGLState:`,e)}}function Ce(){try{e.texImage2D(...arguments)}catch(e){q(`WebGLState:`,e)}}function we(){try{e.texImage3D(...arguments)}catch(e){q(`WebGLState:`,e)}}function Te(t){return d[t]===void 0?e.getParameter(t):d[t]}function Ee(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function De(t){ne.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ne.copy(t))}function Oe(t){R.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),R.copy(t))}function ke(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Ae(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function je(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},I=null,L={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ne.set(0,0,e.canvas.width,e.canvas.height),R.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ie,disable:ae,bindFramebuffer:oe,drawBuffers:B,useProgram:se,setBlending:ue,setMaterial:de,setFlipSided:fe,setCullFace:pe,setLineWidth:me,setPolygonOffset:he,setScissorTest:ge,activeTexture:V,bindTexture:_e,unbindTexture:ve,compressedTexImage2D:ye,compressedTexImage3D:H,texImage2D:Ce,texImage3D:we,pixelStorei:Ee,getParameter:Te,updateUBOMapping:ke,uniformBlockBinding:Ae,texStorage2D:xe,texStorage3D:Se,texSubImage2D:U,texSubImage3D:W,compressedTexSubImage2D:G,compressedTexSubImage3D:be,scissor:De,viewport:Oe,reset:je}}function ed(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Y,u=new WeakMap,d=new Set,f,p=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function h(e,t){return m?new OffscreenCanvas(e,t):rn(`canvas`)}function g(e,t,n){let r=1,i=ye(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=h(n,a));let o=t?h(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),K(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&K(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function _(e){return e.generateMipmaps}function v(t){e.generateMipmap(t)}function y(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function b(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];K(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||K(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Yt:qn.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function x(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,K(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function S(e,t){return _(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&u.delete(t),t.isHTMLTexture&&d.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),D(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function D(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let O=0;function k(){O=0}function A(){return O}function j(e){O=e}function M(){let e=O;return e>=i.maxTextures&&K(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),O+=1,e}function N(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function P(t,i){let a=r.get(t);if(t.isVideoTexture&&_e(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)K(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)K(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ae(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function F(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ae(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function I(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ae(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function L(t,i){let a=r.get(t);t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version?oe(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ee={[Te]:e.REPEAT,[Ee]:e.CLAMP_TO_EDGE,[De]:e.MIRRORED_REPEAT},te={[Oe]:e.NEAREST,[ke]:e.NEAREST_MIPMAP_NEAREST,[Ae]:e.NEAREST_MIPMAP_LINEAR,[je]:e.LINEAR,[Me]:e.LINEAR_MIPMAP_NEAREST,[Ne]:e.LINEAR_MIPMAP_LINEAR},ne={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function R(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&K(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ee[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ee[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ee[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,te[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,te[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ne[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function re(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=N(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function z(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ie(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=z(n.start,r.width,4),c=z(t.start,r.width,4);n.start<=i+1&&a===c&&z(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ae(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=re(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=qn.getPrimaries(qn.workingColorSpace),r=o.colorSpace===``?null:qn.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=g(o.image,!1,i.maxTextureSize);t=ve(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=b(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);R(c,o);let h,y=o.mipmaps,C=o.isVideoTexture!==!0,w=f.__version===void 0||l===!0,T=u.dataReady,E=S(o,t);if(o.isDepthTexture)m=x(o.format===Ze,o.type),w&&(C?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(y.length>0){C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else C?(w&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&ie(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){C&&w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,y[0].width,y[0].height,t.depth);for(let i=0,a=y.length;i<a;i++)if(h=y[i],o.format!==1023){if(r!==null){if(C){if(T){if(o.layerUpdates.size>0){let t=Js(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else K(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else C?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],o.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?K(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(C){if(w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=Js(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)C?(w&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(w){if(C)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(y.length>0){if(C&&w){let t=ye(y[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(C){if(w){let r=ye(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);_(o)&&v(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function oe(t,o,s){if(o.image.length!==6)return;let c=re(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=qn.getPrimaries(qn.workingColorSpace),r=o.colorSpace===``?null:qn.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=g(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=ve(o,m[e]);let h=m[0],y=a.convert(o.format,o.colorSpace),x=a.convert(o.type),C=b(o.internalFormat,y,x,o.normalized,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=S(o,h);R(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,h.width,h.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,y,x,i.data):y===null?K(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=ye(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,y,x,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,y,x,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,y,x,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,y,x,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,y,x,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,y,x,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,y,x,i.image[t])}}}_(o)&&v(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function B(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=b(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),V(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,ge(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function se(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=x(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;V(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ge(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ge(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=b(o.internalFormat,c,l,o.normalized,o.colorSpace);V(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ge(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ge(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ce(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,(!l.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,C)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),R(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else P(i.depthTexture,0);let u=l.__webglTexture,d=ge(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)V(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)V(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function le(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)ce(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?ce(i.__webglFramebuffer[0],t,0):ce(i.__webglFramebuffer,t,0)}}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),se(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),se(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ue(t,n,i){let a=r.get(t);n!==void 0&&B(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&le(t)}function de(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&V(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=b(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=ge(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),se(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),R(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)B(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else B(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);_(i)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),R(c,a),B(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),_(a)&&v(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),R(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)B(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else B(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);_(i)&&v(r),n.unbindTexture()}t.depthBuffer&&le(t)}function fe(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(_(a)){let t=y(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),v(t),n.unbindTexture()}}}let pe=[],me=[];function he(t){if(t.samples>0){if(V(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(pe.length=0,me.length=0,pe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(pe.push(l),me.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,me)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,pe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function ge(e){return Math.min(i.maxSamples,e.samples)}function V(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function _e(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function ve(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(qn.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&K(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):q(`WebGLTextures: Unsupported texture color space:`,n)),t}function ye(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=M,this.resetTextureUnits=k,this.getTextureUnits=A,this.setTextureUnits=j,this.setTexture2D=P,this.setTexture2DArray=F,this.setTexture3D=I,this.setTextureCube=L,this.rebindTextures=ue,this.setupRenderTarget=de,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=he,this.setupDepthRenderbuffer=le,this.setupFrameBufferTexture=B,this.useMultisampledRTT=V,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function td(e,t){function n(n,r=``){let i,a=qn.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var nd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,rd=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,id=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new po(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Po({vertexShader:nd,fragmentShader:rd,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Q(new xo(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ad=class extends fn{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new id,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new Y,C=null,w=null,T=new vs;T.viewport=new ir;let E=new vs;E.viewport=new ir;let D=[T,E],O=new ks,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new zr,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new zr,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new zr,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function M(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,M),r.removeEventListener(`inputsourceschange`,N);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,R.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&K(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&K(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,M),r.addEventListener(`inputsourceschange`,N),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Ze:Xe,a=_.stencil?We:ze);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new or(d.textureWidth,d.textureHeight,{format:Ye,type:Pe,depthTexture:new uo(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new or(f.framebufferWidth,f.framebufferHeight,{format:Ye,type:Pe,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),R.setContext(r),R.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function N(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let P=new X,F=new X;function I(e,t,n){P.setFromMatrixPosition(t.matrixWorld),F.setFromMatrixPosition(n.matrixWorld);let r=P.distanceTo(F),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function L(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;L(O,i);for(let e=0;e<a.length;e++)L(a[e],i);a.length===2?I(O,T,E):O.projectionMatrix.copy(T.projectionMatrix),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ee(e,O,i)};function ee(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=gn*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let te=null;function ne(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new vs,o.layers.enable(n),o.viewport=new ir,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new po,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}te&&te(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let R=new Xs;R.setAnimationLoop(ne),this.setAnimationLoop=function(e){te=e},this.dispose=function(){}}},od=new lr,sd=new Hn;sd.set(-1,0,0,0,1,0,0,0,1);function cd(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Ao(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(od.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(sd),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ld(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return q(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?K(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):K(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var ud=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),dd=null;function fd(){return dd===null&&(dd=new ja(ud,16,16,et,Ve),dd.name=`DFG_LUT`,dd.minFilter=je,dd.magFilter=je,dd.wrapS=Ee,dd.wrapT=Ee,dd.generateMipmaps=!1,dd.needsUpdate=!0),dd}var pd=class{constructor(e={}){let{canvas:t=an(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Pe}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([nt,tt,$e]),g=new Set([Pe,ze,Le,We,He,Ue]),_=new Uint32Array(4),v=new Int32Array(4),y=new X,b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=qt;let j=0,M=0,N=null,P=-1,F=null,I=new ir,L=new ir,ee=null,te=new Z(0),ne=0,R=t.width,re=t.height,z=1,ie=null,ae=null,oe=new ir(0,0,R,re),B=new ir(0,0,R,re),se=!1,ce=new Wa,le=!1,ue=!1,de=new lr,fe=new X,pe=new ir,me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},he=!1;function ge(){return N===null?z:1}let V=n;function _e(e,n){return t.getContext(e,n)}let ve,ye,H,U,W,G,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Fe,Ie,Re,Be;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,qe,!1),t.addEventListener(`webglcontextrestored`,Je,!1),t.addEventListener(`webglcontextcreationerror`,Ye,!1),V===null){let t=`webgl2`;if(V=_e(t,e),V===null)throw _e(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}Ge()}catch(e){throw t.removeEventListener(`webglcontextlost`,qe,!1),t.removeEventListener(`webglcontextrestored`,Je,!1),t.removeEventListener(`webglcontextcreationerror`,Ye,!1),q(`WebGLRenderer: `+e.message),e}function Ge(){ve=new jc(V),ve.init(),Ie=new td(V,ve),ye=new oc(V,ve,e,Ie),H=new $u(V,ve),ye.reversedDepthBuffer&&d&&H.buffers.depth.setReversed(!0),O=V.createFramebuffer(),k=V.createFramebuffer(),A=V.createFramebuffer(),U=new Pc(V),W=new Nu,G=new ed(V,ve,H,W,ye,Ie,U),be=new Ac(T),xe=new Zs(V),Re=new ic(V,xe),Se=new Mc(V,xe,U,Re),Ce=new Ic(V,Se,xe,Re,U),je=new Fc(V,ye,G),Oe=new sc(W),we=new Mu(T,be,ve,ye,Re,Oe),Te=new cd(T,W),Ee=new Lu,De=new Wu(ve),Ae=new rc(T,be,H,Ce,p,s),ke=new Qu(T,Ce,ye),Be=new ld(V,U,ye,H),Me=new ac(V,ve,U),Fe=new Nc(V,ve,U),U.programs=we.programs,T.capabilities=ye,T.extensions=ve,T.properties=W,T.renderLists=Ee,T.shadowMap=ke,T.state=H,T.info=U}m!==1009&&(w=new Rc(m,t.width,t.height,o,r,i));let Ke=new ad(T,V);this.xr=Ke,this.getContext=function(){return V},this.getContextAttributes=function(){return V.getContextAttributes()},this.forceContextLoss=function(){let e=ve.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=ve.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(e){e!==void 0&&(z=e,this.setSize(R,re,!1))},this.getSize=function(e){return e.set(R,re)},this.setSize=function(e,n,r=!0){Ke.isPresenting?K(`WebGLRenderer: Can't change size while VR device is presenting.`):(R=e,re=n,t.width=Math.floor(e*z),t.height=Math.floor(n*z),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(R*z,re*z).floor()},this.setDrawingBufferSize=function(e,n,r){R=e,re=n,z=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)q(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){K(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(I)},this.getViewport=function(e){return e.copy(oe)},this.setViewport=function(e,t,n,r){e.isVector4?oe.set(e.x,e.y,e.z,e.w):oe.set(e,t,n,r),H.viewport(I.copy(oe).multiplyScalar(z).round())},this.getScissor=function(e){return e.copy(B)},this.setScissor=function(e,t,n,r){e.isVector4?B.set(e.x,e.y,e.z,e.w):B.set(e,t,n,r),H.scissor(L.copy(B).multiplyScalar(z).round())},this.getScissorTest=function(){return se},this.setScissorTest=function(e){H.setScissorTest(se=e)},this.setOpaqueSort=function(e){ie=e},this.setTransparentSort=function(e){ae=e},this.getClearColor=function(e){return e.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor(...arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=h.has(t)}if(e){let e=N.texture.type,t=g.has(e),n=Ae.getClearColor(),r=Ae.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,V.clearBufferuiv(V.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,V.clearBufferiv(V.COLOR,0,v))}else r|=V.COLOR_BUFFER_BIT}t&&(r|=V.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=V.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&V.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,qe,!1),t.removeEventListener(`webglcontextrestored`,Je,!1),t.removeEventListener(`webglcontextcreationerror`,Ye,!1),Ae.dispose(),Ee.dispose(),De.dispose(),W.dispose(),be.dispose(),Ce.dispose(),Re.dispose(),Be.dispose(),we.dispose(),Ke.dispose(),Ke.removeEventListener(`sessionstart`,at),Ke.removeEventListener(`sessionend`,ot),st.stop()};function qe(e){e.preventDefault(),sn(`WebGLRenderer: Context Lost.`),E=!0}function Je(){sn(`WebGLRenderer: Context Restored.`),E=!1;let e=U.autoReset,t=ke.enabled,n=ke.autoUpdate,r=ke.needsUpdate,i=ke.type;Ge(),U.autoReset=e,ke.enabled=t,ke.autoUpdate=n,ke.needsUpdate=r,ke.type=i}function Ye(e){q(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Xe(e){let t=e.target;t.removeEventListener(`dispose`,Xe),Ze(t)}function Ze(e){Qe(e),W.remove(e)}function Qe(e){let t=W.get(e).programs;t!==void 0&&(t.forEach(function(e){we.releaseProgram(e)}),e.isShaderMaterial&&we.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=me);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=_t(e,t,n,r,i);H.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Se.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Re.setup(i,r,s,n,c);let h,g=Me;if(c!==null&&(h=xe.get(c),g=Fe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(H.setLineWidth(r.wireframeLinewidth*ge()),g.setMode(V.LINES)):g.setMode(V.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),H.setLineWidth(e*ge()),i.isLineSegments?g.setMode(V.LINES):i.isLineLoop?g.setMode(V.LINE_LOOP):g.setMode(V.LINE_STRIP)}else i.isPoints?g.setMode(V.POINTS):i.isSprite&&g.setMode(V.TRIANGLES);if(i.isBatchedMesh){if(ve.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?xe.get(c).bytesPerElement:1,o=W.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(V,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function et(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),le===!0&&Oe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,pt(e,t,r),e.side=0,e.needsUpdate=!0,pt(e,t,r),e.side=2):pt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=De.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),ue=this.localClippingEnabled,le=Oe.init(this.clippingPlanes,ue),le===!0&&Oe.setGlobalState(this.clippingPlanes,t),D!==null&&ke.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];et(o,n,t,e),r.add(o)}else et(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=W.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}ve.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let rt=null;function it(e){rt&&rt(e)}function at(){st.stop()}function ot(){st.start()}let st=new Xs;st.setAnimationLoop(it),typeof self<`u`&&st.setContext(self),this.setAnimationLoop=function(e){rt=e,Ke.setAnimationLoop(e),e===null?st.stop():st.start()},Ke.addEventListener(`sessionstart`,at),Ke.addEventListener(`sessionend`,ot),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){q(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Ke.enabled===!0&&Ke.isPresenting===!0,r=w!==null&&(N===null||n)&&w.begin(T,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ke.enabled===!0&&Ke.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Ke.cameraAutoUpdate===!0&&Ke.updateCamera(t),t=Ke.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,N),x=De.get(e,C.length),x.init(t),x.state.textureUnits=G.getTextureUnits(),C.push(x),de.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ce.setFromProjectionMatrix(de,en,t.reversedDepth),ue=this.localClippingEnabled,le=Oe.init(this.clippingPlanes,ue),b=Ee.get(e,S.length),b.init(),S.push(b),Ke.enabled===!0&&Ke.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&ct(e,t,-1/0,T.sortObjects)}ct(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(ie,ae),he=Ke.enabled===!1||Ke.isPresenting===!1||Ke.hasDepthSensing()===!1,he&&Ae.addToRenderList(b,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),le===!0&&Oe.beginShadows();let i=x.state.shadowsArray;if(ke.render(i,e,t),le===!0&&Oe.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];ut(n,r,e,a)}he&&Ae.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];lt(b,e,n,n.viewport)}}else r.length>0&&ut(n,r,e,t),he&&Ae.render(e),lt(b,e,t)}N!==null&&M===0&&(G.updateMultisampleRenderTarget(N),G.updateRenderTargetMipmap(N)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Re.resetDefaultState(),P=-1,F=null,C.pop(),C.length>0?(x=C[C.length-1],G.setTextureUnits(x.state.textureUnits),le===!0&&Oe.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function ct(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)x.pushLightProbeGrid(e);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(ce)){r&&pe.setFromMatrixPosition(e.matrixWorld).applyMatrix4(de);let i=Ce.update(e),a=e.material;a.visible&&b.push(e,i,a,n,pe.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(ce))){let i=Ce.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),pe.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),pe.copy(e.boundingSphere.center)),pe.applyMatrix4(e.matrixWorld).applyMatrix4(de)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,pe.z,s,t)}}else a.visible&&b.push(e,i,a,n,pe.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)ct(i[e],t,n,r)}function lt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),le===!0&&Oe.setGlobalState(T.clippingPlanes,n),r&&H.viewport(I.copy(r)),i.length>0&&dt(i,t,n),a.length>0&&dt(a,t,n),o.length>0&&dt(o,t,n),H.buffers.depth.setTest(!0),H.buffers.depth.setMask(!0),H.buffers.color.setMask(!0),H.setPolygonOffset(!1)}function ut(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=ve.has(`EXT_color_buffer_half_float`)||ve.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new or(1,1,{generateMipmaps:!0,type:e?Ve:Pe,minFilter:Ne,samples:Math.max(4,ye.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:qn.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||I;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(te),ne=T.getClearAlpha(),ne<1&&T.setClearColor(16777215,.5),T.clear(),he&&Ae.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),le===!0&&Oe.setGlobalState(T.clippingPlanes,r),dt(e,n,r),G.updateMultisampleRenderTarget(a),G.updateRenderTargetMipmap(a),ve.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,ft(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(G.updateMultisampleRenderTarget(a),G.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(te,ne),d!==void 0&&(r.viewport=d),T.toneMapping=u}function dt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ft(o,t,n,s,l,c)}}function ft(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function pt(e,t,n){t.isScene!==!0&&(t=me);let r=W.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=we.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=we.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=be.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Xe),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return ht(e,s),d}else s.uniforms=we.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=we.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Oe.uniform),ht(e,s),r.needsLights=yt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=x.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function mt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Gl.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ht(e,t){let n=W.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function gt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];y.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(y))return n}return null}function _t(e,t,n,r,i){t.isScene!==!0&&(t=me),G.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?T.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:qn.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=be.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=W.get(r),y=x.state.lights;if(le===!0&&(ue===!0||e!==F)){let t=e===F&&r.id===P;Oe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Oe.numPlanes||v.numIntersection!==Oe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=x.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;b===!0&&(S=pt(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,S,v));let C=!1,w=!1,E=!1,O=S.getUniforms(),k=v.uniforms;if(H.useProgram(S.program)&&(C=!0,w=!0,E=!0),r.id!==P&&(P=r.id,w=!0),v.needsLights){let e=gt(x.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,w=!0)}if(C||F!==e){H.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(V,`projectionMatrix`,e.projectionMatrix),O.setValue(V,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(V,fe.setFromMatrixPosition(e.matrixWorld)),ye.logarithmicDepthBuffer&&O.setValue(V,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(V,`isOrthographic`,e.isOrthographicCamera===!0),F!==e&&(F=e,w=!0,E=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&O.setValue(V,`sunShadowMap`,y.state.sunShadowMap,G),y.state.directionalShadowMap.length>0&&O.setValue(V,`directionalShadowMap`,y.state.directionalShadowMap,G),y.state.spotShadowMap.length>0&&O.setValue(V,`spotShadowMap`,y.state.spotShadowMap,G),y.state.pointShadowMap.length>0&&O.setValue(V,`pointShadowMap`,y.state.pointShadowMap,G)),i.isSkinnedMesh){O.setOptional(V,i,`bindMatrix`),O.setOptional(V,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(V,`boneTexture`,e.boneTexture,G))}i.isBatchedMesh&&(O.setOptional(V,i,`batchingTexture`),O.setValue(V,`batchingTexture`,i._matricesTexture,G),O.setOptional(V,i,`batchingIdTexture`),O.setValue(V,`batchingIdTexture`,i._indirectTexture,G),O.setOptional(V,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(V,`batchingColorTexture`,i._colorsTexture,G));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&je.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,O.setValue(V,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),k.dfgLUT!==void 0&&(k.dfgLUT.value=fd()),w){if(O.setValue(V,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&vt(k,E),a&&r.fog===!0&&Te.refreshFogUniforms(k,a),Te.refreshMaterialUniforms(k,r,z,re,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;k.probesSH.value=e.texture,k.probesMin.value.copy(e.boundingBox.min),k.probesMax.value.copy(e.boundingBox.max),k.probesResolution.value.copy(e.resolution)}Gl.upload(V,mt(v),k,G)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Gl.upload(V,mt(v),k,G),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(V,`center`,i.center),O.setValue(V,`modelViewMatrix`,i.modelViewMatrix),O.setValue(V,`normalMatrix`,i.normalMatrix),O.setValue(V,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Be.update(n,S),Be.bind(n,S)}}return S}function vt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function yt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return M},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=W.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),W.get(e.texture).__webglTexture=t,W.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=W.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,j=t,M=n;let r=null,i=!1,a=!1;if(e){let o=W.get(e);if(o.__useDefaultFramebuffer!==void 0){H.bindFramebuffer(V.FRAMEBUFFER,o.__webglFramebuffer),I.copy(e.viewport),L.copy(e.scissor),ee=e.scissorTest,H.viewport(I),H.scissor(L),H.setScissorTest(ee),P=-1;return}if(o.__webglFramebuffer===void 0)G.setupRenderTarget(e);else if(o.__hasExternalTextures)G.rebindTextures(e,W.get(e.texture).__webglTexture,W.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&W.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);G.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=W.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&G.useMultisampledRTT(e)===!1?W.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,I.copy(e.viewport),L.copy(e.scissor),ee=e.scissorTest}else I.copy(oe).multiplyScalar(z).floor(),L.copy(B).multiplyScalar(z).floor(),ee=se;if(n!==0&&(r=O),H.bindFramebuffer(V.FRAMEBUFFER,r)&&H.drawBuffers(e,r),H.viewport(I),H.scissor(L),H.setScissorTest(ee),i){let r=W.get(e.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=W.get(e.textures[t]);V.framebufferTextureLayer(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=W.get(e.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,t.__webglTexture,n)}P=-1};function bt(e){let t=W.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=ye.textureFormatReadable(e.format),t.__typeReadable=ye.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){q(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=W.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){H.bindFramebuffer(V.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&V.readBuffer(V.COLOR_ATTACHMENT0+s);let u=bt(o);if(u.__formatReadable===!1){q(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){q(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&V.readPixels(t,n,r,i,Ie.convert(c),Ie.convert(l),a)}finally{let e=N===null?null:W.get(N).__webglFramebuffer;H.bindFramebuffer(V.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=W.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){H.bindFramebuffer(V.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&V.readBuffer(V.COLOR_ATTACHMENT0+s);let d=bt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=V.createBuffer();V.bindBuffer(V.PIXEL_PACK_BUFFER,f),V.bufferData(V.PIXEL_PACK_BUFFER,a.byteLength,V.STREAM_READ),V.readPixels(t,n,r,i,Ie.convert(l),Ie.convert(u),0),V.bindBuffer(V.PIXEL_PACK_BUFFER,null);let p=N===null?null:W.get(N).__webglFramebuffer;H.bindFramebuffer(V.FRAMEBUFFER,p);let m=V.fenceSync(V.SYNC_GPU_COMMANDS_COMPLETE,0);return V.flush(),await un(V,m,4),V.bindBuffer(V.PIXEL_PACK_BUFFER,f),V.getBufferSubData(V.PIXEL_PACK_BUFFER,0,a),V.bindBuffer(V.PIXEL_PACK_BUFFER,null),V.deleteBuffer(f),V.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;G.setTexture2D(e,0),V.copyTexSubImage2D(V.TEXTURE_2D,n,0,0,o,s,i,a),H.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ie.convert(t.format),_=Ie.convert(t.type),v;t.isData3DTexture?(G.setTexture3D(t,0),v=V.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(G.setTexture2DArray(t,0),v=V.TEXTURE_2D_ARRAY):(G.setTexture2D(t,0),v=V.TEXTURE_2D),H.activeTexture(V.TEXTURE0),H.pixelStorei(V.UNPACK_FLIP_Y_WEBGL,t.flipY),H.pixelStorei(V.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),H.pixelStorei(V.UNPACK_ALIGNMENT,t.unpackAlignment);let y=H.getParameter(V.UNPACK_ROW_LENGTH),b=H.getParameter(V.UNPACK_IMAGE_HEIGHT),x=H.getParameter(V.UNPACK_SKIP_PIXELS),S=H.getParameter(V.UNPACK_SKIP_ROWS),C=H.getParameter(V.UNPACK_SKIP_IMAGES);H.pixelStorei(V.UNPACK_ROW_LENGTH,h.width),H.pixelStorei(V.UNPACK_IMAGE_HEIGHT,h.height),H.pixelStorei(V.UNPACK_SKIP_PIXELS,l),H.pixelStorei(V.UNPACK_SKIP_ROWS,u),H.pixelStorei(V.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=W.get(e),r=W.get(t),h=W.get(n.__renderTarget),g=W.get(r.__renderTarget);H.bindFramebuffer(V.READ_FRAMEBUFFER,h.__webglFramebuffer),H.bindFramebuffer(V.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,W.get(e).__webglTexture,i,d+n),V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,W.get(t).__webglTexture,a,m+n)),V.blitFramebuffer(l,u,o,s,f,p,o,s,V.DEPTH_BUFFER_BIT,V.NEAREST);H.bindFramebuffer(V.READ_FRAMEBUFFER,null),H.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||W.has(e)){let n=W.get(e),r=W.get(t);H.bindFramebuffer(V.READ_FRAMEBUFFER,k),H.bindFramebuffer(V.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):V.framebufferTexture2D(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,n.__webglTexture,i),T?V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):V.framebufferTexture2D(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,r.__webglTexture,a),i===0?T?V.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):V.copyTexSubImage2D(v,a,f,p,l,u,o,s):V.blitFramebuffer(l,u,o,s,f,p,o,s,V.COLOR_BUFFER_BIT,V.NEAREST);H.bindFramebuffer(V.READ_FRAMEBUFFER,null),H.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?V.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?V.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):V.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?V.texSubImage2D(V.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?V.compressedTexSubImage2D(V.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):V.texSubImage2D(V.TEXTURE_2D,a,f,p,o,s,g,_,h);H.pixelStorei(V.UNPACK_ROW_LENGTH,y),H.pixelStorei(V.UNPACK_IMAGE_HEIGHT,b),H.pixelStorei(V.UNPACK_SKIP_PIXELS,x),H.pixelStorei(V.UNPACK_SKIP_ROWS,S),H.pixelStorei(V.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&V.generateMipmap(v),H.unbindTexture()},this.initRenderTarget=function(e){W.get(e).__webglFramebuffer===void 0&&G.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?G.setTextureCube(e,0):e.isData3DTexture?G.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?G.setTexture2DArray(e,0):G.setTexture2D(e,0),H.unbindTexture()},this.resetState=function(){j=0,M=0,N=null,H.reset(),Re.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return en}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=qn._getDrawingBufferColorSpace(e),t.unpackColorSpace=qn._getUnpackColorSpace()}};function md(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function hd(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.__proto__=t}var gd={autoSleep:120,force3D:`auto`,nullTargetWarn:1,units:{lineHeight:``}},_d={duration:.5,overwrite:!1,delay:0},vd,yd,bd,xd=1e8,Sd=1/xd,Cd=Math.PI*2,wd=Cd/4,Td=0,Ed=Math.sqrt,Dd=Math.cos,Od=Math.sin,kd=function(e){return typeof e==`string`},Ad=function(e){return typeof e==`function`},jd=function(e){return typeof e==`number`},Md=function(e){return e===void 0},Nd=function(e){return typeof e==`object`},Pd=function(e){return e!==!1},Fd=function(){return typeof window<`u`},Id=function(e){return Ad(e)||kd(e)},Ld=typeof ArrayBuffer==`function`&&ArrayBuffer.isView||function(){},Rd=Array.isArray,zd=/random\([^)]+\)/g,Bd=/,\s*/g,Vd=/(?:-?\.?\d|\.)+/gi,Hd=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,Ud=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,Wd=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,Gd=/[+-]=-?[.\d]+/,Kd=/[^,'"\[\]\s]+/gi,qd=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Jd,Yd,Xd,Zd,Qd={},$d={},ef,tf=function(e){return($d=Pf(e,Qd))&&$m},nf=function(e,t){return console.warn(`Invalid property`,e,`set to`,t,`Missing plugin? gsap.registerPlugin()`)},rf=function(e,t){return!t&&console.warn(e)},af=function(e,t){return e&&(Qd[e]=t)&&$d&&($d[e]=t)||Qd},of=function(){return 0},sf={suppressEvents:!0,isStart:!0,kill:!1},cf={suppressEvents:!0,kill:!1},lf={suppressEvents:!0},uf={},df=[],ff={},pf,mf={},hf={},gf=30,_f=[],vf=``,yf=function(e){var t=e[0],n,r;if(Nd(t)||Ad(t)||(e=[e]),!(n=(t._gsap||{}).harness)){for(r=_f.length;r--&&!_f[r].targetTest(t););n=_f[r]}for(r=e.length;r--;)e[r]&&(e[r]._gsap||(e[r]._gsap=new lm(e[r],n)))||e.splice(r,1);return e},bf=function(e){return e._gsap||yf(_p(e))[0]._gsap},xf=function(e,t,n){return(n=e[t])&&Ad(n)?e[t]():Md(n)&&e.getAttribute&&e.getAttribute(t)||n},Sf=function(e,t){return(e=e.split(`,`)).forEach(t)||e},Cf=function(e){return Math.round(e*1e5)/1e5||0},wf=function(e){return Math.round(e*1e7)/1e7||0},Tf=function(e,t){var n=t.charAt(0),r=parseFloat(t.substr(2));return e=parseFloat(e),n===`+`?e+r:n===`-`?e-r:n===`*`?e*r:e/r},Ef=function(e,t){for(var n=t.length,r=0;e.indexOf(t[r])<0&&++r<n;);return r<n},Df=function(){var e=df.length,t=df.slice(0),n,r;for(ff={},df.length=0,n=0;n<e;n++)r=t[n],r&&r._lazy&&(r.render(r._lazy[0],r._lazy[1],!0)._lazy=0)},Of=function(e){return!!(e._initted||e._startAt||e.add)},kf=function(e,t,n,r){df.length&&!yd&&Df(),e.render(t,n,r||!!(yd&&t<0&&Of(e))),df.length&&!yd&&Df()},Af=function(e){var t=parseFloat(e);return(t||t===0)&&(e+``).match(Kd).length<2?t:kd(e)?e.trim():e},jf=function(e){return e},Mf=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},Nf=function(e){return function(t,n){for(var r in n)r in t||r===`duration`&&e||r===`ease`||(t[r]=n[r])}},Pf=function(e,t){for(var n in t)e[n]=t[n];return e},Ff=function e(t,n){for(var r in n)r!==`__proto__`&&r!==`constructor`&&r!==`prototype`&&(t[r]=Nd(n[r])?e(t[r]||(t[r]={}),n[r]):n[r]);return t},If=function(e,t){var n={},r;for(r in e)r in t||(n[r]=e[r]);return n},Lf=function(e){var t=e.parent||Jd,n=e.keyframes?Nf(Rd(e.keyframes)):Mf;if(Pd(e.inherit))for(;t;)n(e,t.vars.defaults),t=t.parent||t._dp;return e},Rf=function(e,t){for(var n=e.length,r=n===t.length;r&&n--&&e[n]===t[n];);return n<0},zf=function(e,t,n,r,i){n===void 0&&(n=`_first`),r===void 0&&(r=`_last`);var a=e[r],o;if(i)for(o=t[i];a&&a[i]>o;)a=a._prev;return a?(t._next=a._next,a._next=t):(t._next=e[n],e[n]=t),t._next?t._next._prev=t:e[r]=t,t._prev=a,t.parent=t._dp=e,t},Bf=function(e,t,n,r){n===void 0&&(n=`_first`),r===void 0&&(r=`_last`);var i=t._prev,a=t._next;i?i._next=a:e[n]===t&&(e[n]=a),a?a._prev=i:e[r]===t&&(e[r]=i),t._next=t._prev=t.parent=null},Vf=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},Hf=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var n=e;n;)n._dirty=1,n=n.parent;return e},Uf=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Wf=function(e,t,n,r){return e._startAt&&(yd?e._startAt.revert(cf):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,r))},Gf=function e(t){return!t||t._ts&&e(t.parent)},Kf=function(e){return e._repeat?qf(e._tTime,e=e.duration()+e._rDelay)*e:0},qf=function(e,t){var n=Math.floor(e=wf(e/t));return e&&n===e?n-1:n},Jf=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},Yf=function(e){return e._end=wf(e._start+(e._tDur/Math.abs(e._ts||e._rts||Sd)||0))},Xf=function(e,t){var n=e._dp;return n&&n.smoothChildTiming&&e._ts&&(e._start=wf(n._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),Yf(e),n._dirty||Hf(n,e)),e},Zf=function(e,t){var n;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(n=Jf(e.rawTime(),t),(!t._dur||dp(0,t.totalDuration(),n)-t._tTime>Sd)&&t.render(n,!0)),Hf(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(n=e;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;e._zTime=-Sd}},Qf=function(e,t,n,r){return t.parent&&Vf(t),t._start=wf((jd(n)?n:n||e!==Jd?cp(e,n,t):e._time)+t._delay),t._end=wf(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),zf(e,t,`_first`,`_last`,e._sort?`_start`:0),np(t)||(e._recent=t),r||Zf(e,t),e._ts<0&&Xf(e,e._tTime),e},$f=function(e,t){return(Qd.ScrollTrigger||nf(`scrollTrigger`,t))&&Qd.ScrollTrigger.create(t,e)},ep=function(e,t,n,r,i){if(vm(e,t,i),!e._initted)return 1;if(!n&&e._pt&&!yd&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&pf!==Yp.frame)return df.push(e),e._lazy=[i,r],1},tp=function e(t){var n=t.parent;return n&&n._ts&&n._initted&&!n._lock&&(n.rawTime()<0||e(n))},np=function(e){var t=e.data;return t===`isFromStart`||t===`isStart`},rp=function(e,t,n,r){var i=e.ratio,a=t<0||!t&&(!e._start&&tp(e)&&(e._initted||!np(e))||(e._ts<0||e._dp._ts<0)&&!np(e))?0:1,o=e._rDelay,s=0,c,l,u;if(o&&e._repeat&&(s=dp(0,e._tDur,t),l=qf(s,o),e._yoyo&&l&1&&(a=1-a),l!==qf(e._tTime,o)&&(i=1-a,e.vars.repeatRefresh&&e._initted&&e.invalidate())),a!==i||yd||r||e._zTime===Sd||!t&&e._zTime){if(!e._initted&&ep(e,t,r,n,s))return;for(u=e._zTime,e._zTime=t||(n?Sd:0),n||=t&&!u,e.ratio=a,e._from&&(a=1-a),e._time=0,e._tTime=s,c=e._pt;c;)c.r(a,c.d),c=c._next;t<0&&Wf(e,t,n,!0),e._onUpdate&&!n&&Pp(e,`onUpdate`),s&&e._repeat&&!n&&e.parent&&Pp(e,`onRepeat`),(t>=e._tDur||t<0)&&e.ratio===a&&(a&&Vf(e,1),!n&&!yd&&(Pp(e,a?`onComplete`:`onReverseComplete`,!0),e._prom&&e._prom()))}else e._zTime||=t},ip=function(e,t,n){var r;if(n>t)for(r=e._first;r&&r._start<=n;){if(r.data===`isPause`&&r._start>t)return r;r=r._next}else for(r=e._last;r&&r._start>=n;){if(r.data===`isPause`&&r._start<t)return r;r=r._prev}},ap=function(e,t,n,r){var i=e._repeat,a=wf(t)||0,o=e._tTime/e._tDur;return o&&!r&&(e._time*=a/e._dur),e._dur=a,e._tDur=i?i<0?1e10:wf(a*(i+1)+e._rDelay*i):a,o>0&&!r&&Xf(e,e._tTime=e._tDur*o),e.parent&&Yf(e),n||Hf(e.parent,e),e},op=function(e){return e instanceof dm?Hf(e):ap(e,e._dur)},sp={_start:0,endTime:of,totalDuration:of},cp=function e(t,n,r){var i=t.labels,a=t._recent||sp,o=t.duration()>=xd?a.endTime(!1):t._dur,s,c,l;return kd(n)&&(isNaN(n)||n in i)?(c=n.charAt(0),l=n.substr(-1)===`%`,s=n.indexOf(`=`),c===`<`||c===`>`?(s>=0&&(n=n.replace(/=/,``)),(c===`<`?a._start:a.endTime(a._repeat>=0))+(parseFloat(n.substr(1))||0)*(l?(s<0?a:r).totalDuration()/100:1)):s<0?(n in i||(i[n]=o),i[n]):(c=parseFloat(n.charAt(s-1)+n.substr(s+1)),l&&r&&(c=c/100*(Rd(r)?r[0]:r).totalDuration()),s>1?e(t,n.substr(0,s-1),r)+c:o+c)):n==null?o:+n},lp=function(e,t,n){var r=jd(t[1]),i=(r?2:1)+(e<2?0:1),a=t[i],o,s;if(r&&(a.duration=t[1]),a.parent=n,e){for(o=a,s=n;s&&!(`immediateRender`in o);)o=s.vars.defaults||{},s=Pd(s.vars.inherit)&&s.parent;a.immediateRender=Pd(o.immediateRender),e<2?a.runBackwards=1:a.startAt=t[i-1]}return new Tm(t[0],a,t[i+1])},up=function(e,t){return e||e===0?t(e):t},dp=function(e,t,n){return n<e?e:n>t?t:n},fp=function(e,t){return!kd(e)||!(t=qd.exec(e))?``:t[1]},pp=function(e,t,n){return up(n,function(n){return dp(e,t,n)})},mp=[].slice,hp=function(e,t){return e&&Nd(e)&&`length`in e&&(!t&&!e.length||e.length-1 in e&&Nd(e[0]))&&!e.nodeType&&e!==Yd},gp=function(e,t,n){return n===void 0&&(n=[]),e.forEach(function(e){var r;return kd(e)&&!t||hp(e,1)?(r=n).push.apply(r,_p(e)):n.push(e)})||n},_p=function(e,t,n){return bd&&!t&&bd.selector?bd.selector(e):kd(e)&&!n&&(Xd||!Xp())?mp.call((t||Zd).querySelectorAll(e),0):Rd(e)?gp(e,n):hp(e)?mp.call(e,0):e?[e]:[]},vp=function(e){return e=_p(e)[0]||rf(`Invalid scope`)||{},function(t){var n=e.current||e.nativeElement||e;return _p(t,n.querySelectorAll?n:n===e?rf(`Invalid scope`)||Zd.createElement(`div`):e)}},yp=function(e){return e.sort(function(){return .5-Math.random()})},bp=function(e){if(Ad(e))return e;var t=Nd(e)?e:{each:e},n=im(t.ease),r=t.from||0,i=parseFloat(t.base)||0,a={},o=r>0&&r<1,s=isNaN(r)||o,c=t.axis,l=r,u=r;return kd(r)?l=u={center:.5,edges:.5,end:1}[r]||0:!o&&s&&(l=r[0],u=r[1]),function(e,o,d){var f=(d||t).length,p=a[f],m,h,g,_,v,y,b,x,S;if(!p){if(S=t.grid===`auto`?0:(t.grid||[1,xd])[1],!S){for(b=-xd;b<(b=d[S++].getBoundingClientRect().left)&&S<f;);S<f&&S--}for(p=a[f]=[],m=s?Math.min(S,f)*l-.5:r%S,h=S===xd?0:s?f*u/S-.5:r/S|0,b=0,x=xd,y=0;y<f;y++)g=y%S-m,_=h-(y/S|0),p[y]=v=c?Math.abs(c===`y`?_:g):Ed(g*g+_*_),v>b&&(b=v),v<x&&(x=v);r===`random`&&yp(p),p.max=b-x,p.min=x,p.v=f=(parseFloat(t.amount)||parseFloat(t.each)*(S>f?f-1:c?c===`y`?f/S:S:Math.max(S,f/S))||0)*(r===`edges`?-1:1),p.b=f<0?i-f:i,p.u=fp(t.amount||t.each)||0,n=n&&f<0?rm(n):n}return f=(p[e]-p.min)/p.max||0,wf(p.b+(n?n(f):f)*p.v)+p.u}},xp=function(e){var t=10**((e+``).split(`.`)[1]||``).length;return function(n){var r=wf(Math.round(parseFloat(n)/e)*e*t);return(r-r%1)/t+(jd(n)?0:fp(n))}},Sp=function(e,t){var n=Rd(e),r,i;return!n&&Nd(e)&&(r=n=e.radius||xd,e.values?(e=_p(e.values),(i=!jd(e[0]))&&(r*=r)):e=xp(e.increment)),up(t,n?Ad(e)?function(t){return i=e(t),Math.abs(i-t)<=r?i:t}:function(t){for(var n=parseFloat(i?t.x:t),a=parseFloat(i?t.y:0),o=xd,s=0,c=e.length,l,u;c--;)i?(l=e[c].x-n,u=e[c].y-a,l=l*l+u*u):l=Math.abs(e[c]-n),l<o&&(o=l,s=c);return s=!r||o<=r?e[s]:t,i||s===t||jd(t)?s:s+fp(t)}:xp(e))},Cp=function(e,t,n,r){return up(Rd(e)?!t:n===!0?!!(n=0):!r,function(){return Rd(e)?e[~~(Math.random()*e.length)]:(n||=1e-5)&&(r=n<1?10**((n+``).length-2):1)&&Math.floor(Math.round((e-n/2+Math.random()*(t-e+n*.99))/n)*n*r)/r})},wp=function(){var e=[...arguments];return function(t){return e.reduce(function(e,t){return t(e)},t)}},Tp=function(e,t){return function(n){return e(parseFloat(n))+(t||fp(n))}},Ep=function(e,t,n){return jp(e,t,0,1,n)},Dp=function(e,t,n){return up(n,function(n){return e[~~t(n)]})},Op=function e(t,n,r){var i=n-t;return Rd(t)?Dp(t,e(0,t.length),n):up(r,function(e){return(i+(e-t)%i)%i+t})},kp=function e(t,n,r){var i=n-t,a=i*2;return Rd(t)?Dp(t,e(0,t.length-1),n):up(r,function(e){return e=(a+(e-t)%a)%a||0,t+(e>i?a-e:e)})},Ap=function(e){return e.replace(zd,function(e){var t=e.indexOf(`[`)+1,n=e.substring(t||7,t?e.indexOf(`]`):e.length-1).split(Bd);return Cp(t?n:+n[0],t?0:+n[1],+n[2]||1e-5)})},jp=function(e,t,n,r,i){var a=t-e,o=r-n;return up(i,function(t){return n+((t-e)/a*o||0)})},Mp=function e(t,n,r,i){var a=isNaN(t+n)?0:function(e){return(1-e)*t+e*n};if(!a){var o=kd(t),s={},c,l,u,d,f;if(r===!0&&(i=1)&&(r=null),o)t={p:t},n={p:n};else if(Rd(t)&&!Rd(n)){for(u=[],d=t.length,f=d-2,l=1;l<d;l++)u.push(e(t[l-1],t[l]));d--,a=function(e){e*=d;var t=Math.min(f,~~e);return u[t](e-t)},r=n}else i||(t=Pf(Rd(t)?[]:{},t));if(!u){for(c in n)pm.call(s,t,c,`get`,n[c]);a=function(e){return Pm(e,s)||(o?t.p:t)}}}return up(r,a)},Np=function(e,t,n){var r=e.labels,i=xd,a,o,s;for(a in r)o=r[a]-t,o<0==!!n&&o&&i>(o=Math.abs(o))&&(s=a,i=o);return s},Pp=function(e,t,n){var r=e.vars,i=r[t],a=bd,o=e._ctx,s,c,l;if(i)return s=r[t+`Params`],c=r.callbackScope||e,n&&df.length&&Df(),o&&(bd=o),l=s?i.apply(c,s):i.call(c),bd=a,l},Fp=function(e){return Vf(e),e.scrollTrigger&&e.scrollTrigger.kill(!!yd),e.progress()<1&&Pp(e,`onInterrupt`),e},Ip,Lp=[],Rp=function(e){if(e){if(e=!e.name&&e.default||e,Fd()||e.headless){var t=e.name,n=Ad(e),r=t&&!n&&e.init?function(){this._props=[]}:e,i={init:of,render:Pm,add:pm,kill:Im,modifier:Fm,rawVars:0},a={targetTest:0,get:0,getSetter:Am,aliases:{},register:0};if(Xp(),e!==r){if(mf[t])return;Mf(r,Mf(If(e,i),a)),Pf(r.prototype,Pf(i,If(e,a))),mf[r.prop=t]=r,e.targetTest&&(_f.push(r),uf[t]=1),t=(t===`css`?`CSS`:t.charAt(0).toUpperCase()+t.substr(1))+`Plugin`}af(t,r),e.register&&e.register($m,r,zm)}else Lp.push(e)}},zp=255,Bp={aqua:[0,zp,zp],lime:[0,zp,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,zp],navy:[0,0,128],white:[zp,zp,zp],olive:[128,128,0],yellow:[zp,zp,0],orange:[zp,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[zp,0,0],pink:[zp,192,203],cyan:[0,zp,zp],transparent:[zp,zp,zp,0]},Vp=function(e,t,n){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(n-t)*e*6:e<.5?n:e*3<2?t+(n-t)*(2/3-e)*6:t)*zp+.5|0},Hp=function(e,t,n){var r=e?jd(e)?[e>>16,e>>8&zp,e&zp]:0:Bp.black,i,a,o,s,c,l,u,d,f,p;if(!r){if(e.substr(-1)===`,`&&(e=e.substr(0,e.length-1)),Bp[e])r=Bp[e];else if(e.charAt(0)===`#`){if(e.length<6&&(i=e.charAt(1),a=e.charAt(2),o=e.charAt(3),e=`#`+i+i+a+a+o+o+(e.length===5?e.charAt(4)+e.charAt(4):``)),e.length===9)return r=parseInt(e.substr(1,6),16),[r>>16,r>>8&zp,r&zp,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),r=[e>>16,e>>8&zp,e&zp]}else if(e.substr(0,3)===`hsl`){if(r=p=e.match(Vd),!t)s=r[0]%360/360,c=r[1]/100,l=r[2]/100,a=l<=.5?l*(c+1):l+c-l*c,i=l*2-a,r.length>3&&(r[3]*=1),r[0]=Vp(s+1/3,i,a),r[1]=Vp(s,i,a),r[2]=Vp(s-1/3,i,a);else if(~e.indexOf(`=`))return r=e.match(Hd),n&&r.length<4&&(r[3]=1),r}else r=e.match(Vd)||Bp.transparent;r=r.map(Number)}return t&&!p&&(i=r[0]/zp,a=r[1]/zp,o=r[2]/zp,u=Math.max(i,a,o),d=Math.min(i,a,o),l=(u+d)/2,u===d?s=c=0:(f=u-d,c=l>.5?f/(2-u-d):f/(u+d),s=u===i?(a-o)/f+(a<o?6:0):u===a?(o-i)/f+2:(i-a)/f+4,s*=60),r[0]=~~(s+.5),r[1]=~~(c*100+.5),r[2]=~~(l*100+.5)),n&&r.length<4&&(r[3]=1),r},Up=function(e){var t=[],n=[],r=-1;return e.split(Gp).forEach(function(e){var i=e.match(Ud)||[];t.push.apply(t,i),n.push(r+=i.length+1)}),t.c=n,t},Wp=function(e,t,n){var r=``,i=(e+r).match(Gp),a=t?`hsla(`:`rgba(`,o=0,s,c,l,u;if(!i)return e;if(i=i.map(function(e){return(e=Hp(e,t,1))&&a+(t?e[0]+`,`+e[1]+`%,`+e[2]+`%,`+e[3]:e.join(`,`))+`)`}),n&&(l=Up(e),s=n.c,s.join(r)!==l.c.join(r)))for(c=e.replace(Gp,`1`).split(Ud),u=c.length-1;o<u;o++)r+=c[o]+(~s.indexOf(o)?i.shift()||a+`0,0,0,0)`:(l.length?l:i.length?i:n).shift());if(!c)for(c=e.split(Gp),u=c.length-1;o<u;o++)r+=c[o]+i[o];return r+c[u]},Gp=function(){var e=`(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b`,t;for(t in Bp)e+=`|`+t+`\\b`;return RegExp(e+`)`,`gi`)}(),Kp=/hsl[a]?\(/,qp=function(e){var t=e.join(` `),n;if(Gp.lastIndex=0,Gp.test(t))return n=Kp.test(t),e[1]=Wp(e[1],n),e[0]=Wp(e[0],n,Up(e[1])),!0},Jp,Yp=function(){var e=Date.now,t=500,n=33,r=e(),i=r,a=1e3/240,o=a,s=[],c,l,u,d,f,p,m=function u(m){var h=e()-i,g=m===!0,_,v,y,b;if((h>t||h<0)&&(r+=h-n),i+=h,y=i-r,_=y-o,(_>0||g)&&(b=++d.frame,f=y-d.time*1e3,d.time=y/=1e3,o+=_+(_>=a?4:a-_),v=1),g||(c=l(u)),v)for(p=0;p<s.length;p++)s[p](y,f,b,m)};return d={time:0,frame:0,tick:function(){m(!0)},deltaRatio:function(e){return f/(1e3/(e||60))},wake:function(){ef&&(!Xd&&Fd()&&(Yd=Xd=window,Zd=Yd.document||{},Qd.gsap=$m,(Yd.gsapVersions||(Yd.gsapVersions=[])).push($m.version),tf($d||Yd.GreenSockGlobals||!Yd.gsap&&Yd||{}),Lp.forEach(Rp)),u=typeof requestAnimationFrame<`u`&&requestAnimationFrame,c&&d.sleep(),l=u||function(e){return setTimeout(e,o-d.time*1e3+1|0)},Jp=1,m(2))},sleep:function(){(u?cancelAnimationFrame:clearTimeout)(c),Jp=0,l=of},lagSmoothing:function(e,r){t=e||1/0,n=Math.min(r||33,t)},fps:function(e){a=1e3/(e||240),o=d.time*1e3+a},add:function(e,t,n){var r=t?function(t,n,i,a){e(t,n,i,a),d.remove(r)}:e;return d.remove(e),s[n?`unshift`:`push`](r),Xp(),r},remove:function(e,t){~(t=s.indexOf(e))&&s.splice(t,1)&&p>=t&&p--},_listeners:s},d}(),Xp=function(){return!Jp&&Yp.wake()},Zp={},Qp=/^[\d.\-M][\d.\-,\s]/,$p=/["']/g,em=function(e){for(var t={},n=e.substr(1,e.length-3).split(`:`),r=n[0],i=1,a=n.length,o,s,c;i<a;i++)s=n[i],o=i===a-1?s.length:s.lastIndexOf(`,`),c=s.substr(0,o),t[r]=isNaN(c)?c.replace($p,``).trim():+c,r=s.substr(o+1).trim();return t},tm=function(e){var t=e.indexOf(`(`)+1,n=e.indexOf(`)`),r=e.indexOf(`(`,t);return e.substring(t,~r&&r<n?e.indexOf(`)`,n+1):n)},nm=function(e){var t=(e+``).split(`(`),n=Zp[t[0]];return n&&t.length>1&&n.config?n.config.apply(null,~e.indexOf(`{`)?[em(t[1])]:tm(e).split(`,`).map(Af)):Zp._CE&&Qp.test(e)?Zp._CE(``,e):n},rm=function(e){return function(t){return 1-e(1-t)}},im=function(e,t){return e&&(Ad(e)?e:Zp[e]||nm(e))||t},am=function(e,t,n,r){n===void 0&&(n=function(e){return 1-t(1-e)}),r===void 0&&(r=function(e){return e<.5?t(e*2)/2:1-t((1-e)*2)/2});var i={easeIn:t,easeOut:n,easeInOut:r},a;return Sf(e,function(e){for(var t in Zp[e]=Qd[e]=i,Zp[a=e.toLowerCase()]=n,i)Zp[a+(t===`easeIn`?`.in`:t===`easeOut`?`.out`:`.inOut`)]=Zp[e+`.`+t]=i[t]}),i},om=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},sm=function e(t,n,r){var i=n>=1?n:1,a=(r||(t?.3:.45))/(n<1?n:1),o=a/Cd*(Math.asin(1/i)||0),s=function(e){return e===1?1:i*2**(-10*e)*Od((e-o)*a)+1},c=t===`out`?s:t===`in`?function(e){return 1-s(1-e)}:om(s);return a=Cd/a,c.config=function(n,r){return e(t,n,r)},c},cm=function e(t,n){n===void 0&&(n=1.70158);var r=function(e){return e?--e*e*((n+1)*e+n)+1:0},i=t===`out`?r:t===`in`?function(e){return 1-r(1-e)}:om(r);return i.config=function(n){return e(t,n)},i};Sf(`Linear,Quad,Cubic,Quart,Quint,Strong`,function(e,t){var n=t<5?t+1:t;am(e+`,Power`+(n-1),t?function(e){return e**+n}:function(e){return e},function(e){return 1-(1-e)**n},function(e){return e<.5?(e*2)**n/2:1-((1-e)*2)**n/2})}),Zp.Linear.easeNone=Zp.none=Zp.Linear.easeIn,am(`Elastic`,sm(`in`),sm(`out`),sm()),(function(e,t){var n=1/t,r=2*n,i=2.5*n,a=function(a){return a<n?e*a*a:a<r?e*(a-1.5/t)**2+.75:a<i?e*(a-=2.25/t)*a+.9375:e*(a-2.625/t)**2+.984375};am(`Bounce`,function(e){return 1-a(1-e)},a)})(7.5625,2.75),am(`Expo`,function(e){return 2**(10*(e-1))*e+e*e*e*e*e*e*(1-e)}),am(`Circ`,function(e){return-(Ed(1-e*e)-1)}),am(`Sine`,function(e){return e===1?1:-Dd(e*wd)+1}),am(`Back`,cm(`in`),cm(`out`),cm()),Zp.SteppedEase=Zp.steps=Qd.SteppedEase={config:function(e,t){e===void 0&&(e=1);var n=1/e,r=e+ +!t,i=+!!t,a=1-Sd;return function(e){return((r*dp(0,a,e)|0)+i)*n}}},_d.ease=Zp[`quad.out`],Sf(`onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt`,function(e){return vf+=e+`,`+e+`Params,`});var lm=function(e,t){this.id=Td++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:xf,this.set=t?t.getSetter:Am},um=function(){function e(e){this.vars=e,this._delay=+e.delay||0,(this._repeat=e.repeat===1/0?-2:e.repeat||0)&&(this._rDelay=e.repeatDelay||0,this._yoyo=!!e.yoyo||!!e.yoyoEase),this._ts=1,ap(this,+e.duration,1,1),this.data=e.data,bd&&(this._ctx=bd,bd.data.push(this)),Jp||Yp.wake()}var t=e.prototype;return t.delay=function(e){return e||e===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+e-this._delay),this._delay=e,this):this._delay},t.duration=function(e){return arguments.length?this.totalDuration(this._repeat>0?e+(e+this._rDelay)*this._repeat:e):this.totalDuration()&&this._dur},t.totalDuration=function(e){return arguments.length?(this._dirty=0,ap(this,this._repeat<0?e:(e-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},t.totalTime=function(e,t){if(Xp(),!arguments.length)return this._tTime;var n=this._dp;if(n&&n.smoothChildTiming&&this._ts){for(Xf(this,e),!n._dp||n.parent||Zf(n,this);n&&n.parent;)n.parent._time!==n._start+(n._ts>=0?n._tTime/n._ts:(n.totalDuration()-n._tTime)/-n._ts)&&n.totalTime(n._tTime,!0),n=n.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&e<this._tDur||this._ts<0&&e>0||!this._tDur&&!e)&&Qf(this._dp,this,this._start-this._delay)}return(this._tTime!==e||!this._dur&&!t||this._initted&&Math.abs(this._zTime)===Sd||!this._initted&&this._dur&&e||!e&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=e),kf(this,e,t)),this},t.time=function(e,t){return arguments.length?this.totalTime(Math.min(this.totalDuration(),e+Kf(this))%(this._dur+this._rDelay)||(e?this._dur:0),t):this._time},t.totalProgress=function(e,t){return arguments.length?this.totalTime(this.totalDuration()*e,t):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},t.progress=function(e,t){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-e:e)+Kf(this),t):this.duration()?Math.min(1,this._time/this._dur):+(this.rawTime()>0)},t.iteration=function(e,t){var n=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(e-1)*n,t):this._repeat?qf(this._tTime,n)+1:1},t.timeScale=function(e,t){if(!arguments.length)return this._rts===-Sd?0:this._rts;if(this._rts===e)return this;var n=this.parent&&this._ts?Jf(this.parent._time,this):this._tTime;return this._rts=+e||0,this._ts=this._ps||e===-Sd?0:this._rts,this.totalTime(dp(-Math.abs(this._delay),this.totalDuration(),n),t!==!1),Yf(this),Uf(this)},t.paused=function(e){return arguments.length?(this._ps!==e&&(this._ps=e,e?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(Xp(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==Sd&&(this._tTime-=Sd)))),this):this._ps},t.startTime=function(e){if(arguments.length){this._start=wf(e);var t=this.parent||this._dp;return t&&(t._sort||!this.parent)&&Qf(t,this,this._start-this._delay),this}return this._start},t.endTime=function(e){return this._start+(Pd(e)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},t.rawTime=function(e){var t=this.parent||this._dp;return t?e&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Jf(t.rawTime(e),this):this._tTime:this._tTime},t.revert=function(e){e===void 0&&(e=lf);var t=yd;return yd=e,Of(this)&&(this.timeline&&this.timeline.revert(e),this.totalTime(-.01,e.suppressEvents)),this.data!==`nested`&&e.kill!==!1&&this.kill(),yd=t,this},t.globalTime=function(e){for(var t=this,n=arguments.length?e:t.rawTime();t;)n=t._start+n/(Math.abs(t._ts)||1),t=t._dp;return!this.parent&&this._sat?this._sat.globalTime(e):n},t.repeat=function(e){return arguments.length?(this._repeat=e===1/0?-2:e,op(this)):this._repeat===-2?1/0:this._repeat},t.repeatDelay=function(e){if(arguments.length){var t=this._time;return this._rDelay=e,op(this),t?this.time(t):this}return this._rDelay},t.yoyo=function(e){return arguments.length?(this._yoyo=e,this):this._yoyo},t.seek=function(e,t){return this.totalTime(cp(this,e),Pd(t))},t.restart=function(e,t){return this.play().totalTime(e?-this._delay:0,Pd(t)),this._dur||(this._zTime=-Sd),this},t.play=function(e,t){return e!=null&&this.seek(e,t),this.reversed(!1).paused(!1)},t.reverse=function(e,t){return e!=null&&this.seek(e||this.totalDuration(),t),this.reversed(!0).paused(!1)},t.pause=function(e,t){return e!=null&&this.seek(e,t),this.paused(!0)},t.resume=function(){return this.paused(!1)},t.reversed=function(e){return arguments.length?(!!e!==this.reversed()&&this.timeScale(-this._rts||(e?-Sd:0)),this):this._rts<0},t.invalidate=function(){return this._initted=this._act=0,this._zTime=-Sd,this},t.isActive=function(){var e=this.parent||this._dp,t=this._start,n;return!!(!e||this._ts&&this._initted&&e.isActive()&&(n=e.rawTime(!0))>=t&&n<this.endTime(!0)-Sd)},t.eventCallback=function(e,t,n){var r=this.vars;return arguments.length>1?(t?(r[e]=t,n&&(r[e+`Params`]=n),e===`onUpdate`&&(this._onUpdate=t)):delete r[e],this):r[e]},t.then=function(e){var t=this,n=t._prom;return new Promise(function(r){var i=Ad(e)?e:jf,a=function(){var e=t.then;t.then=null,n&&n(),Ad(i)&&(i=i(t))&&(i.then||i===t)&&(t.then=e),r(i),t.then=e};t._initted&&t.totalProgress()===1&&t._ts>=0||!t._tTime&&t._ts<0?a():t._prom=a})},t.kill=function(){Fp(this)},e}();Mf(um.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-Sd,_prom:0,_ps:!1,_rts:1});var dm=function(e){hd(t,e);function t(t,n){var r;return t===void 0&&(t={}),r=e.call(this,t)||this,r.labels={},r.smoothChildTiming=!!t.smoothChildTiming,r.autoRemoveChildren=!!t.autoRemoveChildren,r._sort=Pd(t.sortChildren),Jd&&Qf(t.parent||Jd,md(r),n),t.reversed&&r.reverse(),t.paused&&r.paused(!0),t.scrollTrigger&&$f(md(r),t.scrollTrigger),r}var n=t.prototype;return n.to=function(e,t,n){return lp(0,arguments,this),this},n.from=function(e,t,n){return lp(1,arguments,this),this},n.fromTo=function(e,t,n,r){return lp(2,arguments,this),this},n.set=function(e,t,n){return t.duration=0,t.parent=this,Lf(t).repeatDelay||(t.repeat=0),t.immediateRender=!!t.immediateRender,new Tm(e,t,cp(this,n),1),this},n.call=function(e,t,n){return Qf(this,Tm.delayedCall(0,e,t),n)},n.staggerTo=function(e,t,n,r,i,a,o){return n.duration=t,n.stagger=n.stagger||r,n.onComplete=a,n.onCompleteParams=o,n.parent=this,new Tm(e,n,cp(this,i)),this},n.staggerFrom=function(e,t,n,r,i,a,o){return n.runBackwards=1,Lf(n).immediateRender=Pd(n.immediateRender),this.staggerTo(e,t,n,r,i,a,o)},n.staggerFromTo=function(e,t,n,r,i,a,o,s){return r.startAt=n,Lf(r).immediateRender=Pd(r.immediateRender),this.staggerTo(e,t,r,i,a,o,s)},n.render=function(e,t,n){var r=this._time,i=this._dirty?this.totalDuration():this._tDur,a=this._dur,o=e<=0?0:wf(e),s=this._zTime<0!=e<0&&(this._initted||!a),c,l,u,d,f,p,m,h,g,_,v,y;if(this!==Jd&&o>i&&e>=0&&(o=i),o!==this._tTime||n||s){if(r!==this._time&&a&&(o+=this._time-r,e+=this._time-r),c=o,g=this._start,h=this._ts,p=!h,s&&(a||(r=this._zTime),(e||!t)&&(this._zTime=e)),this._repeat){if(v=this._yoyo,f=a+this._rDelay,this._repeat<-1&&e<0)return this.totalTime(f*100+e,t,n);if(c=wf(o%f),o===i?(d=this._repeat,c=a):(_=wf(o/f),d=~~_,d&&d===_&&(c=a,d--),c>a&&(c=a)),_=qf(this._tTime,f),!r&&this._tTime&&_!==d&&this._tTime-_*f-this._dur<=0&&(_=d),v&&d&1&&(c=a-c,y=1),d!==_&&!this._lock){var b=v&&_&1,x=b===(v&&d&1);if(d<_&&(b=!b),r=b?0:o%a?a:o,this._lock=1,this.render(r||(y?0:wf(d*f)),t,!a)._lock=0,this._tTime=o,!t&&this.parent&&Pp(this,`onRepeat`),this.vars.repeatRefresh&&!y&&(this.invalidate()._lock=1,_=d),r&&r!==this._time||p!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act||(a=this._dur,i=this._tDur,x&&(this._lock=2,r=b?a:-1e-4,this.render(r,!0),this.vars.repeatRefresh&&!y&&this.invalidate()),this._lock=0,!this._ts&&!p))return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(m=ip(this,wf(r),wf(c)),m&&(o-=c-(c=m._start))),this._tTime=o,this._time=c,this._act=!!h,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=e,r=0),!r&&o&&a&&!t&&!_&&(Pp(this,`onStart`),this._tTime!==o))return this;if(c>=r&&e>=0)for(l=this._first;l;){if(u=l._next,(l._act||c>=l._start)&&l._ts&&m!==l){if(l.parent!==this)return this.render(e,t,n);if(l.render(l._ts>0?(c-l._start)*l._ts:(l._dirty?l.totalDuration():l._tDur)+(c-l._start)*l._ts,t,n),c!==this._time||!this._ts&&!p){m=0,u&&(o+=this._zTime=-Sd);break}}l=u}else{l=this._last;for(var S=e<0?e:c;l;){if(u=l._prev,(l._act||S<=l._end)&&l._ts&&m!==l){if(l.parent!==this)return this.render(e,t,n);if(l.render(l._ts>0?(S-l._start)*l._ts:(l._dirty?l.totalDuration():l._tDur)+(S-l._start)*l._ts,t,n||yd&&Of(l)),c!==this._time||!this._ts&&!p){m=0,u&&(o+=this._zTime=S?-Sd:Sd);break}}l=u}}if(m&&!t&&(this.pause(),m.render(c>=r?0:-Sd)._zTime=c>=r?1:-1,this._ts))return this._start=g,Yf(this),this.render(e,t,n);this._onUpdate&&!t&&Pp(this,`onUpdate`,!0),(o===i&&this._tTime>=this.totalDuration()||!o&&r)&&(g===this._start||Math.abs(h)!==Math.abs(this._ts))&&(this._lock||((e||!a)&&(o===i&&this._ts>0||!o&&this._ts<0)&&Vf(this,1),!t&&!(e<0&&!r)&&(o||r||!i)&&(Pp(this,o===i&&e>=0?`onComplete`:`onReverseComplete`,!0),this._prom&&!(o<i&&this.timeScale()>0)&&this._prom())))}return this},n.add=function(e,t){var n=this;if(jd(t)||(t=cp(this,t,e)),!(e instanceof um)){if(Rd(e))return e.forEach(function(e){return n.add(e,t)}),this;if(kd(e))return this.addLabel(e,t);if(Ad(e))e=Tm.delayedCall(0,e);else return this}return this===e?this:Qf(this,e,t)},n.getChildren=function(e,t,n,r){e===void 0&&(e=!0),t===void 0&&(t=!0),n===void 0&&(n=!0),r===void 0&&(r=-xd);for(var i=[],a=this._first;a;)a._start>=r&&(a instanceof Tm?t&&i.push(a):(n&&i.push(a),e&&i.push.apply(i,a.getChildren(!0,t,n)))),a=a._next;return i},n.getById=function(e){for(var t=this.getChildren(1,1,1),n=t.length;n--;)if(t[n].vars.id===e)return t[n]},n.remove=function(e){return kd(e)?this.removeLabel(e):Ad(e)?this.killTweensOf(e):(e.parent===this&&Bf(this,e),e===this._recent&&(this._recent=this._last),Hf(this))},n.totalTime=function(t,n){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=wf(Yp.time-(this._ts>0?t/this._ts:(this.totalDuration()-t)/-this._ts))),e.prototype.totalTime.call(this,t,n),this._forcing=0,this):this._tTime},n.addLabel=function(e,t){return this.labels[e]=cp(this,t),this},n.removeLabel=function(e){return delete this.labels[e],this},n.addPause=function(e,t,n){var r=Tm.delayedCall(0,t||of,n);return r.data=`isPause`,this._hasPause=1,Qf(this,r,cp(this,e))},n.removePause=function(e){var t=this._first;for(e=cp(this,e);t;)t._start===e&&t.data===`isPause`&&Vf(t),t=t._next},n.killTweensOf=function(e,t,n){for(var r=this.getTweensOf(e,n),i=r.length;i--;)gm!==r[i]&&r[i].kill(e,t);return this},n.getTweensOf=function(e,t){for(var n=[],r=_p(e),i=this._first,a=jd(t),o;i;)i instanceof Tm?Ef(i._targets,r)&&(a?(!gm||i._initted&&i._ts)&&i.globalTime(0)<=t&&i.globalTime(i.totalDuration())>t:!t||i.isActive())&&n.push(i):(o=i.getTweensOf(r,t)).length&&n.push.apply(n,o),i=i._next;return n},n.tweenTo=function(e,t){t||={};var n=this,r=cp(n,e),i=t,a=i.startAt,o=i.onStart,s=i.onStartParams,c=i.immediateRender,l,u=Tm.to(n,Mf({ease:t.ease||`none`,lazy:!1,immediateRender:!1,time:r,overwrite:`auto`,duration:t.duration||Math.abs((r-(a&&`time`in a?a.time:n._time))/n.timeScale())||Sd,onStart:function(){if(n.pause(),!l){var e=t.duration||Math.abs((r-(a&&`time`in a?a.time:n._time))/n.timeScale());u._dur!==e&&ap(u,e,0,1).render(u._time,!0,!0),l=1}o&&o.apply(u,s||[])}},t));return c?u.render(0):u},n.tweenFromTo=function(e,t,n){return this.tweenTo(t,Mf({startAt:{time:cp(this,e)}},n))},n.recent=function(){return this._recent},n.nextLabel=function(e){return e===void 0&&(e=this._time),Np(this,cp(this,e))},n.previousLabel=function(e){return e===void 0&&(e=this._time),Np(this,cp(this,e),1)},n.currentLabel=function(e){return arguments.length?this.seek(e,!0):this.previousLabel(this._time+Sd)},n.shiftChildren=function(e,t,n){n===void 0&&(n=0);var r=this._first,i=this.labels,a;for(e=wf(e);r;)r._start>=n&&(r._start+=e,r._end+=e),r=r._next;if(t)for(a in i)i[a]>=n&&(i[a]+=e);return Hf(this)},n.invalidate=function(t){var n=this._first;for(this._lock=0;n;)n.invalidate(t),n=n._next;return e.prototype.invalidate.call(this,t)},n.clear=function(e){e===void 0&&(e=!0);for(var t=this._first,n;t;)n=t._next,this.remove(t),t=n;return this._dp&&(this._time=this._tTime=this._pTime=0),e&&(this.labels={}),Hf(this)},n.totalDuration=function(e){var t=0,n=this,r=n._last,i=xd,a,o,s;if(arguments.length)return n.timeScale((n._repeat<0?n.duration():n.totalDuration())/(n.reversed()?-e:e));if(n._dirty){for(s=n.parent;r;)a=r._prev,r._dirty&&r.totalDuration(),o=r._start,o>i&&n._sort&&r._ts&&!n._lock?(n._lock=1,Qf(n,r,o-r._delay,1)._lock=0):i=o,o<0&&r._ts&&(t-=o,(!s&&!n._dp||s&&s.smoothChildTiming)&&(n._start+=wf(o/n._ts),n._time-=o,n._tTime-=o),n.shiftChildren(-o,!1,-1/0),i=0),r._end>t&&r._ts&&(t=r._end),r=a;ap(n,n===Jd&&n._time>t?n._time:t,1,1),n._dirty=0}return n._tDur},t.updateRoot=function(e){if(Jd._ts&&(kf(Jd,Jf(e,Jd)),pf=Yp.frame),Yp.frame>=gf){gf+=gd.autoSleep||120;var t=Jd._first;if((!t||!t._ts)&&gd.autoSleep&&Yp._listeners.length<2){for(;t&&!t._ts;)t=t._next;t||Yp.sleep()}}},t}(um);Mf(dm.prototype,{_lock:0,_hasPause:0,_forcing:0});var fm=function(e,t,n,r,i,a,o){var s=new zm(this._pt,e,t,0,1,Nm,null,i),c=0,l=0,u,d,f,p,m,h,g,_;for(s.b=n,s.e=r,n+=``,r+=``,(g=~r.indexOf(`random(`))&&(r=Ap(r)),a&&(_=[n,r],a(_,e,t),n=_[0],r=_[1]),d=n.match(Wd)||[];u=Wd.exec(r);)p=u[0],m=r.substring(c,u.index),f?f=(f+1)%5:m.substr(-5)===`rgba(`&&(f=1),p!==d[l++]&&(h=parseFloat(d[l-1])||0,s._pt={_next:s._pt,p:m||l===1?m:`,`,s:h,c:p.charAt(1)===`=`?Tf(h,p)-h:parseFloat(p)-h,m:f&&f<4?Math.round:0},c=Wd.lastIndex);return s.c=c<r.length?r.substring(c,r.length):``,s.fp=o,(Gd.test(r)||g)&&(s.e=0),this._pt=s,s},pm=function(e,t,n,r,i,a,o,s,c,l){Ad(r)&&(r=r(i||0,e,a));var u=e[t],d=n===`get`?Ad(u)?c?e[t.indexOf(`set`)||!Ad(e[`get`+t.substr(3)])?t:`get`+t.substr(3)](c):e[t]():u:n,f=Ad(u)?c?Om:Dm:Em,p;if(kd(r)&&(~r.indexOf(`random(`)&&(r=Ap(r)),r.charAt(1)===`=`&&(p=Tf(d,r)+(fp(d)||0),(p||p===0)&&(r=p))),!l||d!==r||_m)return!isNaN(d*r)&&r!==``?(p=new zm(this._pt,e,t,+d||0,r-(d||0),typeof u==`boolean`?Mm:jm,0,f),c&&(p.fp=c),o&&p.modifier(o,this,e),this._pt=p):(!u&&!(t in e)&&nf(t,r),fm.call(this,e,t,d,r,f,s||gd.stringFilter,c))},mm=function(e,t,n,r,i){if(Ad(e)&&(e=Sm(e,i,t,n,r)),!Nd(e)||e.style&&e.nodeType||Rd(e)||Ld(e))return kd(e)?Sm(e,i,t,n,r):e;var a={},o;for(o in e)a[o]=Sm(e[o],i,t,n,r);return a},hm=function(e,t,n,r,i,a){var o,s,c,l;if(mf[e]&&(o=new mf[e]).init(i,o.rawVars?t[e]:mm(t[e],r,i,a,n),n,r,a)!==!1&&(n._pt=s=new zm(n._pt,i,e,0,1,o.render,o,0,o.priority),n!==Ip))for(c=n._ptLookup[n._targets.indexOf(i)],l=o._props.length;l--;)c[o._props[l]]=s;return o},gm,_m,vm=function e(t,n,r){var i=t.vars,a=i.ease,o=i.startAt,s=i.immediateRender,c=i.lazy,l=i.onUpdate,u=i.runBackwards,d=i.yoyoEase,f=i.keyframes,p=i.autoRevert,m=t._dur,h=t._startAt,g=t._targets,_=t.parent,v=_&&_.data===`nested`?_.vars.targets:g,y=t._overwrite===`auto`&&!vd,b=t.timeline,x=i.easeReverse||d,S,C,w,T,E,D,O,k,A,j,M,N,P;if(b&&(!f||!a)&&(a=`none`),t._ease=im(a,_d.ease),t._rEase=x&&(im(x)||t._ease),t._from=!b&&!!i.runBackwards,t._from&&(t.ratio=1),!b||f&&!i.stagger){if(k=g[0]?bf(g[0]).harness:0,N=k&&i[k.prop],S=If(i,uf),h&&(h._zTime<0&&h.progress(1),n<0&&u&&s&&!p?h.render(-1,!0):h.revert(u&&m?cf:sf),h._lazy=0),o){if(Vf(t._startAt=Tm.set(g,Mf({data:`isStart`,overwrite:!1,parent:_,immediateRender:!0,lazy:!h&&Pd(c),startAt:null,delay:0,onUpdate:l&&function(){return Pp(t,`onUpdate`)},stagger:0},o))),t._startAt._dp=0,t._startAt._sat=t,n<0&&(yd||!s&&!p)&&t._startAt.revert(cf),s&&m&&n<=0&&r<=0){n&&(t._zTime=n);return}}else if(u&&m&&!h){if(n&&(s=!1),w=Mf({overwrite:!1,data:`isFromStart`,lazy:s&&!h&&Pd(c),immediateRender:s,stagger:0,parent:_},S),N&&(w[k.prop]=N),Vf(t._startAt=Tm.set(g,w)),t._startAt._dp=0,t._startAt._sat=t,n<0&&(yd?t._startAt.revert(cf):t._startAt.render(-1,!0)),t._zTime=n,!s)e(t._startAt,Sd,Sd);else if(!n)return}for(t._pt=t._ptCache=0,c=m&&Pd(c)||c&&!m,C=0;C<g.length;C++){if(E=g[C],O=E._gsap||yf(g)[C]._gsap,t._ptLookup[C]=j={},ff[O.id]&&df.length&&Df(),M=v===g?C:v.indexOf(E),k&&(A=new k).init(E,N||S,t,M,v)!==!1&&(t._pt=T=new zm(t._pt,E,A.name,0,1,A.render,A,0,A.priority),A._props.forEach(function(e){j[e]=T}),A.priority&&(D=1)),!k||N)for(w in S)mf[w]&&(A=hm(w,S,t,M,E,v))?A.priority&&(D=1):j[w]=T=pm.call(t,E,w,`get`,S[w],M,v,0,i.stringFilter);t._op&&t._op[C]&&t.kill(E,t._op[C]),y&&t._pt&&(gm=t,Jd.killTweensOf(E,j,t.globalTime(n)),P=!t.parent,gm=0),t._pt&&c&&(ff[O.id]=1)}D&&Rm(t),t._onInit&&t._onInit(t)}t._onUpdate=l,t._initted=(!t._op||t._pt)&&!P,f&&n<=0&&b.render(xd,!0,!0)},ym=function(e,t,n,r,i,a,o,s){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],l,u,d,f;if(!c)for(c=e._ptCache[t]=[],d=e._ptLookup,f=e._targets.length;f--;){if(l=d[f][t],l&&l.d&&l.d._pt)for(l=l.d._pt;l&&l.p!==t&&l.fp!==t;)l=l._next;if(!l)return _m=1,e.vars[t]=`+=0`,vm(e,o),_m=0,s?rf(t+` not eligible for reset. Try splitting into individual properties`):1;c.push(l)}for(f=c.length;f--;)u=c[f],l=u._pt||u,l.s=(r||r===0)&&!i?r:l.s+(r||0)+a*l.c,l.c=n-l.s,u.e&&(u.e=Cf(n)+fp(u.e)),u.b&&(u.b=l.s+fp(u.b))},bm=function(e,t){var n=e[0]?bf(e[0]).harness:0,r=n&&n.aliases,i,a,o,s;if(!r)return t;for(a in i=Pf({},t),r)if(a in i)for(s=r[a].split(`,`),o=s.length;o--;)i[s[o]]=i[a];return i},xm=function(e,t,n,r){var i=t.ease||r||`power1.inOut`,a,o;if(Rd(t))o=n[e]||(n[e]=[]),t.forEach(function(e,n){return o.push({t:n/(t.length-1)*100,v:e,e:i})});else for(a in t)o=n[a]||(n[a]=[]),a===`ease`||o.push({t:parseFloat(e),v:t[a],e:i})},Sm=function(e,t,n,r,i){return Ad(e)?e.call(t,n,r,i):kd(e)&&~e.indexOf(`random(`)?Ap(e):e},Cm=vf+`repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert`,wm={};Sf(Cm+`,id,stagger,delay,duration,paused,scrollTrigger`,function(e){return wm[e]=1});var Tm=function(e){hd(t,e);function t(t,n,r,i){var a;typeof n==`number`&&(r.duration=n,n=r,r=null),a=e.call(this,i?n:Lf(n))||this;var o=a.vars,s=o.duration,c=o.delay,l=o.immediateRender,u=o.stagger,d=o.overwrite,f=o.keyframes,p=o.defaults,m=o.scrollTrigger,h=n.parent||Jd,g=(Rd(t)||Ld(t)?jd(t[0]):`length`in n)?[t]:_p(t),_,v,y,b,x,S,C,w;if(a._targets=g.length?yf(g):rf(`GSAP target `+t+` not found. https://gsap.com`,!gd.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=d,f||u||Id(s)||Id(c)){n=a.vars;var T=n.easeReverse||n.yoyoEase;if(_=a.timeline=new dm({data:`nested`,defaults:p||{},targets:h&&h.data===`nested`?h.vars.targets:g}),_.kill(),_.parent=_._dp=md(a),_._start=0,u||Id(s)||Id(c)){if(b=g.length,C=u&&bp(u),Nd(u))for(x in u)~Cm.indexOf(x)&&(w||={},w[x]=u[x]);for(v=0;v<b;v++)y=If(n,wm),y.stagger=0,T&&(y.easeReverse=T),w&&Pf(y,w),S=g[v],y.duration=+Sm(s,md(a),v,S,g),y.delay=(+Sm(c,md(a),v,S,g)||0)-a._delay,!u&&b===1&&y.delay&&(a._delay=c=y.delay,a._start+=c,y.delay=0),_.to(S,y,C?C(v,S,g):0),_._ease=Zp.none;_.duration()?s=c=0:a.timeline=0}else if(f){Lf(Mf(_.vars.defaults,{ease:`none`})),_._ease=im(f.ease||n.ease||`none`);var E=0,D,O,k;if(Rd(f))f.forEach(function(e){return _.to(g,e,`>`)}),_.duration();else{for(x in y={},f)x===`ease`||x===`easeEach`||xm(x,f[x],y,f.easeEach);for(x in y)for(D=y[x].sort(function(e,t){return e.t-t.t}),E=0,v=0;v<D.length;v++)O=D[v],k={ease:O.e,duration:(O.t-(v?D[v-1].t:0))/100*s},k[x]=O.v,_.to(g,k,E),E+=k.duration;_.duration()<s&&_.to({},{duration:s-_.duration()})}}s||a.duration(s=_.duration())}else a.timeline=0;return d===!0&&!vd&&(gm=md(a),Jd.killTweensOf(g),gm=0),Qf(h,md(a),r),n.reversed&&a.reverse(),n.paused&&a.paused(!0),(l||!s&&!f&&a._start===wf(h._time)&&Pd(l)&&Gf(md(a))&&h.data!==`nested`)&&(a._tTime=-Sd,a.render(Math.max(0,-c)||0)),m&&$f(md(a),m),a}var n=t.prototype;return n.render=function(e,t,n){var r=this._time,i=this._tDur,a=this._dur,o=e<0,s=e>i-Sd&&!o?i:e<Sd?0:e,c,l,u,d,f,p,m,h;if(!a)rp(this,e,t,n);else if(s!==this._tTime||!e||n||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==o||this._lazy){if(c=s,h=this.timeline,this._repeat){if(d=a+this._rDelay,this._repeat<-1&&o)return this.totalTime(d*100+e,t,n);if(c=wf(s%d),s===i?(u=this._repeat,c=a):(f=wf(s/d),u=~~f,u&&u===f?(c=a,u--):c>a&&(c=a)),p=this._yoyo&&u&1,p&&(c=a-c),f=qf(this._tTime,d),c===r&&!n&&this._initted&&u===f)return this._tTime=s,this;u!==f&&this.vars.repeatRefresh&&!p&&!this._lock&&c!==d&&this._initted&&(this._lock=n=1,this.render(wf(d*u),!0).invalidate()._lock=0)}if(!this._initted){if(ep(this,o?e:c,n,t,s))return this._tTime=0,this;if(r!==this._time&&!(n&&this.vars.repeatRefresh&&u!==f))return this;if(a!==this._dur)return this.render(e,t,n)}if(this._rEase){var g=c<r;if(g!==this._inv){var _=g?r:a-r;this._inv=g,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=r,this._invRecip=_?(g?-1:1)/_:0,this._invScale=g?-this.ratio:1-this.ratio,this._invEase=g?this._rEase:this._ease}this.ratio=m=this._invRatio+this._invScale*this._invEase((c-this._invTime)*this._invRecip)}else this.ratio=m=this._ease(c/a);if(this._from&&(this.ratio=m=1-m),this._tTime=s,this._time=c,!this._act&&this._ts&&(this._act=1,this._lazy=0),!r&&s&&!t&&!f&&(Pp(this,`onStart`),this._tTime!==s))return this;for(l=this._pt;l;)l.r(m,l.d),l=l._next;h&&h.render(e<0?e:h._dur*h._ease(c/this._dur),t,n)||this._startAt&&(this._zTime=e),this._onUpdate&&!t&&(o&&Wf(this,e,t,n),Pp(this,`onUpdate`)),this._repeat&&u!==f&&this.vars.onRepeat&&!t&&this.parent&&Pp(this,`onRepeat`),(s===this._tDur||!s)&&this._tTime===s&&(o&&!this._onUpdate&&Wf(this,e,!0,!0),(e||!a)&&(s===this._tDur&&this._ts>0||!s&&this._ts<0)&&Vf(this,1),!t&&(!o||r)&&(s||r||p)&&(Pp(this,s===i?`onComplete`:`onReverseComplete`,!0),this._prom&&!(s<i&&this.timeScale()>0)&&this._prom()))}return this},n.targets=function(){return this._targets},n.invalidate=function(t){return(!t||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(t),e.prototype.invalidate.call(this,t)},n.resetTo=function(e,t,n,r,i){Jp||Yp.wake(),this._ts||this.play();var a=Math.min(this._dur,(this._dp._time-this._start)*this._ts),o;return this._initted||vm(this,a),o=this._ease(a/this._dur),ym(this,e,t,n,r,o,a,i)?this.resetTo(e,t,n,r,1):(Xf(this,0),this.parent||zf(this._dp,this,`_first`,`_last`,this._dp._sort?`_start`:0),this.render(0))},n.kill=function(e,t){if(t===void 0&&(t=`all`),!e&&(!t||t===`all`))return this._lazy=this._pt=0,this.parent?Fp(this):this.scrollTrigger&&this.scrollTrigger.kill(!!yd),this;if(this.timeline){var n=this.timeline.totalDuration();return this.timeline.killTweensOf(e,t,gm&&gm.vars.overwrite!==!0)._first||Fp(this),this.parent&&n!==this.timeline.totalDuration()&&ap(this,this._dur*this.timeline._tDur/n,0,1),this}var r=this._targets,i=e?_p(e):r,a=this._ptLookup,o=this._pt,s,c,l,u,d,f,p;if((!t||t===`all`)&&Rf(r,i))return t===`all`&&(this._pt=0),Fp(this);for(s=this._op=this._op||[],t!==`all`&&(kd(t)&&(d={},Sf(t,function(e){return d[e]=1}),t=d),t=bm(r,t)),p=r.length;p--;)if(~i.indexOf(r[p]))for(d in c=a[p],t===`all`?(s[p]=t,u=c,l={}):(l=s[p]=s[p]||{},u=t),u)f=c&&c[d],f&&((!(`kill`in f.d)||f.d.kill(d)===!0)&&Bf(this,f,`_pt`),delete c[d]),l!==`all`&&(l[d]=1);return this._initted&&!this._pt&&o&&Fp(this),this},t.to=function(e,n){return new t(e,n,arguments[2])},t.from=function(e,t){return lp(1,arguments)},t.delayedCall=function(e,n,r,i){return new t(n,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:e,onComplete:n,onReverseComplete:n,onCompleteParams:r,onReverseCompleteParams:r,callbackScope:i})},t.fromTo=function(e,t,n){return lp(2,arguments)},t.set=function(e,n){return n.duration=0,n.repeatDelay||(n.repeat=0),new t(e,n)},t.killTweensOf=function(e,t,n){return Jd.killTweensOf(e,t,n)},t}(um);Mf(Tm.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0}),Sf(`staggerTo,staggerFrom,staggerFromTo`,function(e){Tm[e]=function(){var t=new dm,n=mp.call(arguments,0);return n.splice(e===`staggerFromTo`?5:4,0,0),t[e].apply(t,n)}});var Em=function(e,t,n){return e[t]=n},Dm=function(e,t,n){return e[t](n)},Om=function(e,t,n,r){return e[t](r.fp,n)},km=function(e,t,n){return e.setAttribute(t,n)},Am=function(e,t){return Ad(e[t])?Dm:Md(e[t])&&e.setAttribute?km:Em},jm=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},Mm=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},Nm=function(e,t){var n=t._pt,r=``;if(!e&&t.b)r=t.b;else if(e===1&&t.e)r=t.e;else{for(;n;)r=n.p+(n.m?n.m(n.s+n.c*e):Math.round((n.s+n.c*e)*1e4)/1e4)+r,n=n._next;r+=t.c}t.set(t.t,t.p,r,t)},Pm=function(e,t){for(var n=t._pt;n;)n.r(e,n.d),n=n._next},Fm=function(e,t,n,r){for(var i=this._pt,a;i;)a=i._next,i.p===r&&i.modifier(e,t,n),i=a},Im=function(e){for(var t=this._pt,n,r;t;)r=t._next,t.p===e&&!t.op||t.op===e?Bf(this,t,`_pt`):t.dep||(n=1),t=r;return!n},Lm=function(e,t,n,r){r.mSet(e,t,r.m.call(r.tween,n,r.mt),r)},Rm=function(e){for(var t=e._pt,n,r,i,a;t;){for(n=t._next,r=i;r&&r.pr>t.pr;)r=r._next;(t._prev=r?r._prev:a)?t._prev._next=t:i=t,(t._next=r)?r._prev=t:a=t,t=n}e._pt=i},zm=function(){function e(e,t,n,r,i,a,o,s,c){this.t=t,this.s=r,this.c=i,this.p=n,this.r=a||jm,this.d=o||this,this.set=s||Em,this.pr=c||0,this._next=e,e&&(e._prev=this)}var t=e.prototype;return t.modifier=function(e,t,n){this.mSet=this.mSet||this.set,this.set=Lm,this.m=e,this.mt=n,this.tween=t},e}();Sf(vf+`parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse`,function(e){return uf[e]=1}),Qd.TweenMax=Qd.TweenLite=Tm,Qd.TimelineLite=Qd.TimelineMax=dm,Jd=new dm({sortChildren:!1,defaults:_d,autoRemoveChildren:!0,id:`root`,smoothChildTiming:!0}),gd.stringFilter=qp;var Bm=[],Vm={},Hm=[],Um=0,Wm=0,Gm=function(e){return(Vm[e]||Hm).map(function(e){return e()})},Km=function(){var e=Date.now(),t=[];e-Um>2&&(Gm(`matchMediaInit`),Bm.forEach(function(e){var n=e.queries,r=e.conditions,i,a,o,s;for(a in n)i=Yd.matchMedia(n[a]).matches,i&&(o=1),i!==r[a]&&(r[a]=i,s=1);s&&(e.revert(),o&&t.push(e))}),Gm(`matchMediaRevert`),t.forEach(function(e){return e.onMatch(e,function(t){return e.add(null,t)})}),Um=e,Gm(`matchMedia`))},qm=function(){function e(e,t){this.selector=t&&vp(t),this.data=[],this._r=[],this.isReverted=!1,this.id=Wm++,e&&this.add(e)}var t=e.prototype;return t.add=function(e,t,n){Ad(e)&&(n=t,t=e,e=Ad);var r=this,i=function(){var e=bd,i=r.selector,a;return e&&e!==r&&e.data.push(r),n&&(r.selector=vp(n)),bd=r,a=t.apply(r,arguments),Ad(a)&&r._r.push(a),bd=e,r.selector=i,r.isReverted=!1,a};return r.last=i,e===Ad?i(r,function(e){return r.add(null,e)}):e?r[e]=i:i},t.ignore=function(e){var t=bd;bd=null,e(this),bd=t},t.getTweens=function(){var t=[];return this.data.forEach(function(n){return n instanceof e?t.push.apply(t,n.getTweens()):n instanceof Tm&&!(n.parent&&n.parent.data===`nested`)&&t.push(n)}),t},t.clear=function(){this._r.length=this.data.length=0},t.kill=function(e,t){var n=this;if(e?(function(){for(var t=n.getTweens(),r=n.data.length,i;r--;)i=n.data[r],i.data===`isFlip`&&(i.revert(),i.getChildren(!0,!0,!1).forEach(function(e){return t.splice(t.indexOf(e),1)}));for(t.map(function(e){return{g:e._dur||e._delay||e._sat&&!e._sat.vars.immediateRender?e.globalTime(0):-1/0,t:e}}).sort(function(e,t){return t.g-e.g||-1/0}).forEach(function(t){return t.t.revert(e)}),r=n.data.length;r--;)i=n.data[r],i instanceof dm?i.data!==`nested`&&(i.scrollTrigger&&i.scrollTrigger.revert(),i.kill()):!(i instanceof Tm)&&i.revert&&i.revert(e);n._r.forEach(function(t){return t(e,n)}),n.isReverted=!0})():this.data.forEach(function(e){return e.kill&&e.kill()}),this.clear(),t)for(var r=Bm.length;r--;)Bm[r].id===this.id&&Bm.splice(r,1)},t.revert=function(e){this.kill(e||{})},e}(),Jm=function(){function e(e){this.contexts=[],this.scope=e,bd&&bd.data.push(this)}var t=e.prototype;return t.add=function(e,t,n){Nd(e)||(e={matches:e});var r=new qm(0,n||this.scope),i=r.conditions={},a,o,s;for(o in bd&&!r.selector&&(r.selector=bd.selector),this.contexts.push(r),t=r.add(`onMatch`,t),r.queries=e,e)o===`all`?s=1:(a=Yd.matchMedia(e[o]),a&&(Bm.indexOf(r)<0&&Bm.push(r),(i[o]=a.matches)&&(s=1),a.addListener?a.addListener(Km):a.addEventListener(`change`,Km)));return s&&t(r,function(e){return r.add(null,e)}),this},t.revert=function(e){this.kill(e||{})},t.kill=function(e){this.contexts.forEach(function(t){return t.kill(e,!0)})},e}(),Ym={registerPlugin:function(){[...arguments].forEach(function(e){return Rp(e)})},timeline:function(e){return new dm(e)},getTweensOf:function(e,t){return Jd.getTweensOf(e,t)},getProperty:function(e,t,n,r){kd(e)&&(e=_p(e)[0]);var i=bf(e||{}).get,a=n?jf:Af;return n===`native`&&(n=``),e&&(t?a((mf[t]&&mf[t].get||i)(e,t,n,r)):function(t,n,r){return a((mf[t]&&mf[t].get||i)(e,t,n,r))})},quickSetter:function(e,t,n){if(e=_p(e),e.length>1){var r=e.map(function(e){return $m.quickSetter(e,t,n)}),i=r.length;return function(e){for(var t=i;t--;)r[t](e)}}e=e[0]||{};var a=mf[t],o=bf(e),s=o.harness&&(o.harness.aliases||{})[t]||t,c=a?function(t){var r=new a;Ip._pt=0,r.init(e,n?t+n:t,Ip,0,[e]),r.render(1,r),Ip._pt&&Pm(1,Ip)}:o.set(e,s);return a?c:function(t){return c(e,s,n?t+n:t,o,1)}},quickTo:function(e,t,n){var r,i=$m.to(e,Mf((r={},r[t]=`+=0.1`,r.paused=!0,r.stagger=0,r),n||{})),a=function(e,n,r){return i.resetTo(t,e,n,r)};return a.tween=i,a},isTweening:function(e){return Jd.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=im(e.ease,_d.ease)),Ff(_d,e||{})},config:function(e){return Ff(gd,e||{})},registerEffect:function(e){var t=e.name,n=e.effect,r=e.plugins,i=e.defaults,a=e.extendTimeline;(r||``).split(`,`).forEach(function(e){return e&&!mf[e]&&!Qd[e]&&rf(t+` effect requires `+e+` plugin.`)}),hf[t]=function(e,t,r){return n(_p(e),Mf(t||{},i),r)},a&&(dm.prototype[t]=function(e,n,r){return this.add(hf[t](e,Nd(n)?n:(r=n)&&{},this),r)})},registerEase:function(e,t){Zp[e]=im(t)},parseEase:function(e,t){return arguments.length?im(e,t):Zp},getById:function(e){return Jd.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var n=new dm(e),r,i;for(n.smoothChildTiming=Pd(e.smoothChildTiming),Jd.remove(n),n._dp=0,n._time=n._tTime=Jd._time,r=Jd._first;r;)i=r._next,(t||!(!r._dur&&r instanceof Tm&&r.vars.onComplete===r._targets[0]))&&Qf(n,r,r._start-r._delay),r=i;return Qf(Jd,n,0),n},context:function(e,t){return e?new qm(e,t):bd},matchMedia:function(e){return new Jm(e)},matchMediaRefresh:function(){return Bm.forEach(function(e){var t=e.conditions,n,r;for(r in t)t[r]&&(t[r]=!1,n=1);n&&e.revert()})||Km()},addEventListener:function(e,t){var n=Vm[e]||(Vm[e]=[]);~n.indexOf(t)||n.push(t)},removeEventListener:function(e,t){var n=Vm[e],r=n&&n.indexOf(t);r>=0&&n.splice(r,1)},utils:{wrap:Op,wrapYoyo:kp,distribute:bp,random:Cp,snap:Sp,normalize:Ep,getUnit:fp,clamp:pp,splitColor:Hp,toArray:_p,selector:vp,mapRange:jp,pipe:wp,unitize:Tp,interpolate:Mp,shuffle:yp},install:tf,effects:hf,ticker:Yp,updateRoot:dm.updateRoot,plugins:mf,globalTimeline:Jd,core:{PropTween:zm,globals:af,Tween:Tm,Timeline:dm,Animation:um,getCache:bf,_removeLinkedListItem:Bf,reverting:function(){return yd},context:function(e){return e&&bd&&(bd.data.push(e),e._ctx=bd),bd},suppressOverwrites:function(e){return vd=e}}};Sf(`to,from,fromTo,delayedCall,set,killTweensOf`,function(e){return Ym[e]=Tm[e]}),Yp.add(dm.updateRoot),Ip=Ym.to({},{duration:0});var Xm=function(e,t){for(var n=e._pt;n&&n.p!==t&&n.op!==t&&n.fp!==t;)n=n._next;return n},Zm=function(e,t){var n=e._targets,r,i,a;for(r in t)for(i=n.length;i--;)a=e._ptLookup[i][r],(a&&=a.d)&&(a._pt&&(a=Xm(a,r)),a&&a.modifier&&a.modifier(t[r],e,n[i],r))},Qm=function(e,t){return{name:e,headless:1,rawVars:1,init:function(e,n,r){r._onInit=function(e){var r,i;if(kd(n)&&(r={},Sf(n,function(e){return r[e]=1}),n=r),t){for(i in r={},n)r[i]=t(n[i]);n=r}Zm(e,n)}}}},$m=Ym.registerPlugin({name:`attr`,init:function(e,t,n,r,i){var a,o,s;for(a in this.tween=n,t)s=e.getAttribute(a)||``,o=this.add(e,`setAttribute`,(s||0)+``,t[a],r,i,0,0,a),o.op=a,o.b=s,this._props.push(a)},render:function(e,t){for(var n=t._pt;n;)yd?n.set(n.t,n.p,n.b,n):n.r(e,n.d),n=n._next}},{name:`endArray`,headless:1,init:function(e,t){for(var n=t.length;n--;)this.add(e,n,e[n]||0,t[n],0,0,0,0,0,1)}},Qm(`roundProps`,xp),Qm(`modifiers`),Qm(`snap`,Sp))||Ym;Tm.version=dm.version=$m.version=`3.15.0`,ef=1,Fd()&&Xp(),Zp.Power0,Zp.Power1,Zp.Power2,Zp.Power3,Zp.Power4,Zp.Linear,Zp.Quad,Zp.Cubic,Zp.Quart,Zp.Quint,Zp.Strong,Zp.Elastic,Zp.Back,Zp.SteppedEase,Zp.Bounce,Zp.Sine,Zp.Expo,Zp.Circ;var eh,th,nh,rh,ih,ah,oh,sh=function(){return typeof window<`u`},ch={},lh=180/Math.PI,uh=Math.PI/180,dh=Math.atan2,fh=1e8,ph=/([A-Z])/g,mh=/(left|right|width|margin|padding|x)/i,hh=/[\s,\(]\S/,gh={autoAlpha:`opacity,visibility`,scale:`scaleX,scaleY`,alpha:`opacity`},_h=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},vh=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},yh=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},bh=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},xh=function(e,t){var n=t.s+t.c*e;t.set(t.t,t.p,~~(n+(n<0?-.5:.5))+t.u,t)},Sh=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},Ch=function(e,t){return t.set(t.t,t.p,e===1?t.e:t.b,t)},wh=function(e,t,n){return e.style[t]=n},Th=function(e,t,n){return e.style.setProperty(t,n)},Eh=function(e,t,n){return e._gsap[t]=n},Dh=function(e,t,n){return e._gsap.scaleX=e._gsap.scaleY=n},Oh=function(e,t,n,r,i){var a=e._gsap;a.scaleX=a.scaleY=n,a.renderTransform(i,a)},kh=function(e,t,n,r,i){var a=e._gsap;a[t]=n,a.renderTransform(i,a)},Ah=`transform`,jh=Ah+`Origin`,Mh=function e(t,n){var r=this,i=this.target,a=i.style,o=i._gsap;if(t in ch&&a){if(this.tfm=this.tfm||{},t!==`transform`)t=gh[t]||t,~t.indexOf(`,`)?t.split(`,`).forEach(function(e){return r.tfm[e]=Zh(i,e)}):this.tfm[t]=o.x?o[t]:Zh(i,t),t===jh&&(this.tfm.zOrigin=o.zOrigin);else return gh.transform.split(`,`).forEach(function(t){return e.call(r,t,n)});if(this.props.indexOf(Ah)>=0)return;o.svg&&(this.svgo=i.getAttribute(`data-svg-origin`),this.props.push(jh,n,``)),t=Ah}(a||n)&&this.props.push(t,n,a[t])},Nh=function(e){e.translate&&(e.removeProperty(`translate`),e.removeProperty(`scale`),e.removeProperty(`rotate`))},Ph=function(){for(var e=this.props,t=this.target,n=t.style,r=t._gsap,i=0,a;i<e.length;i+=3)e[i+1]?e[i+1]===2?t[e[i]](e[i+2]):t[e[i]]=e[i+2]:e[i+2]?n[e[i]]=e[i+2]:n.removeProperty(e[i].substr(0,2)===`--`?e[i]:e[i].replace(ph,`-$1`).toLowerCase());if(this.tfm){for(a in this.tfm)r[a]=this.tfm[a];r.svg&&(r.renderTransform(),t.setAttribute(`data-svg-origin`,this.svgo||``)),i=oh(),(!i||!i.isStart)&&!n[Ah]&&(Nh(n),r.zOrigin&&n[jh]&&(n[jh]+=` `+r.zOrigin+`px`,r.zOrigin=0,r.renderTransform()),r.uncache=1)}},Fh=function(e,t){var n={target:e,props:[],revert:Ph,save:Mh};return e._gsap||$m.core.getCache(e),t&&e.style&&e.nodeType&&t.split(`,`).forEach(function(e){return n.save(e)}),n},Ih,Lh=function(e,t){var n=th.createElementNS?th.createElementNS((t||`http://www.w3.org/1999/xhtml`).replace(/^https/,`http`),e):th.createElement(e);return n&&n.style?n:th.createElement(e)},Rh=function e(t,n,r){var i=getComputedStyle(t);return i[n]||i.getPropertyValue(n.replace(ph,`-$1`).toLowerCase())||i.getPropertyValue(n)||!r&&e(t,Bh(n)||n,1)||``},zh=`O,Moz,ms,Ms,Webkit`.split(`,`),Bh=function(e,t,n){var r=(t||ih).style,i=5;if(e in r&&!n)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);i--&&!(zh[i]+e in r););return i<0?null:(i===3?`ms`:i>=0?zh[i]:``)+e},Vh=function(){sh()&&window.document&&(eh=window,th=eh.document,nh=th.documentElement,ih=Lh(`div`)||{style:{}},Lh(`div`),Ah=Bh(Ah),jh=Ah+`Origin`,ih.style.cssText=`border-width:0;line-height:0;position:absolute;padding:0`,Ih=!!Bh(`perspective`),oh=$m.core.reverting,rh=1)},Hh=function(e){var t=e.ownerSVGElement,n=Lh(`svg`,t&&t.getAttribute(`xmlns`)||`http://www.w3.org/2000/svg`),r=e.cloneNode(!0),i;r.style.display=`block`,n.appendChild(r),nh.appendChild(n);try{i=r.getBBox()}catch{}return n.removeChild(r),nh.removeChild(n),i},Uh=function(e,t){for(var n=t.length;n--;)if(e.hasAttribute(t[n]))return e.getAttribute(t[n])},Wh=function(e){var t,n;try{t=e.getBBox()}catch{t=Hh(e),n=1}return t&&(t.width||t.height)||n||(t=Hh(e)),t&&!t.width&&!t.x&&!t.y?{x:+Uh(e,[`x`,`cx`,`x1`])||0,y:+Uh(e,[`y`,`cy`,`y1`])||0,width:0,height:0}:t},Gh=function(e){return!(!e.getCTM||e.parentNode&&!e.ownerSVGElement||!Wh(e))},Kh=function(e,t){if(t){var n=e.style,r;t in ch&&t!==jh&&(t=Ah),n.removeProperty?(r=t.substr(0,2),(r===`ms`||t.substr(0,6)===`webkit`)&&(t=`-`+t),n.removeProperty(r===`--`?t:t.replace(ph,`-$1`).toLowerCase())):n.removeAttribute(t)}},qh=function(e,t,n,r,i,a){var o=new zm(e._pt,t,n,0,1,a?Ch:Sh);return e._pt=o,o.b=r,o.e=i,e._props.push(n),o},Jh={deg:1,rad:1,turn:1},Yh={grid:1,flex:1},Xh=function e(t,n,r,i){var a=parseFloat(r)||0,o=(r+``).trim().substr((a+``).length)||`px`,s=ih.style,c=mh.test(n),l=t.tagName.toLowerCase()===`svg`,u=(l?`client`:`offset`)+(c?`Width`:`Height`),d=100,f=i===`px`,p=i===`%`,m,h,g,_;if(i===o||!a||Jh[i]||Jh[o])return a;if(o!==`px`&&!f&&(a=e(t,n,r,`px`)),_=t.getCTM&&Gh(t),(p||o===`%`)&&(ch[n]||~n.indexOf(`adius`)))return m=_?t.getBBox()[c?`width`:`height`]:t[u],Cf(p?a/m*d:a/100*m);if(s[c?`width`:`height`]=d+(f?o:i),h=i!==`rem`&&~n.indexOf(`adius`)||i===`em`&&t.appendChild&&!l?t:t.parentNode,_&&(h=(t.ownerSVGElement||{}).parentNode),(!h||h===th||!h.appendChild)&&(h=th.body),g=h._gsap,g&&p&&g.width&&c&&g.time===Yp.time&&!g.uncache)return Cf(a/g.width*d);if(p&&(n===`height`||n===`width`)){var v=t.style[n];t.style[n]=d+i,m=t[u],v?t.style[n]=v:Kh(t,n)}else(p||o===`%`)&&!Yh[Rh(h,`display`)]&&(s.position=Rh(t,`position`)),h===t&&(s.position=`static`),h.appendChild(ih),m=ih[u],h.removeChild(ih),s.position=`absolute`;return c&&p&&(g=bf(h),g.time=Yp.time,g.width=h[u]),Cf(f?m*a/d:m&&a?d/m*a:0)},Zh=function(e,t,n,r){var i;return rh||Vh(),t in gh&&t!==`transform`&&(t=gh[t],~t.indexOf(`,`)&&(t=t.split(`,`)[0])),ch[t]&&t!==`transform`?(i=lg(e,r),i=t===`transformOrigin`?i.svg?i.origin:ug(Rh(e,jh))+` `+i.zOrigin+`px`:i[t]):(i=e.style[t],(!i||i===`auto`||r||~(i+``).indexOf(`calc(`))&&(i=ng[t]&&ng[t](e,t,n)||Rh(e,t)||xf(e,t)||+(t===`opacity`))),n&&!~(i+``).trim().indexOf(` `)?Xh(e,t,i,n)+n:i},Qh=function(e,t,n,r){if(!n||n===`none`){var i=Bh(t,e,1),a=i&&Rh(e,i,1);a&&a!==n?(t=i,n=a):t===`borderColor`&&(n=Rh(e,`borderTopColor`))}var o=new zm(this._pt,e.style,t,0,1,Nm),s=0,c=0,l,u,d,f,p,m,h,g,_,v,y,b;if(o.b=n,o.e=r,n+=``,r+=``,r.substring(0,6)===`var(--`&&(r=Rh(e,r.substring(4,r.indexOf(`)`)))),r===`auto`&&(m=e.style[t],e.style[t]=r,r=Rh(e,t)||r,m?e.style[t]=m:Kh(e,t)),l=[n,r],qp(l),n=l[0],r=l[1],d=n.match(Ud)||[],b=r.match(Ud)||[],b.length){for(;u=Ud.exec(r);)h=u[0],_=r.substring(s,u.index),p?p=(p+1)%5:(_.substr(-5)===`rgba(`||_.substr(-5)===`hsla(`)&&(p=1),h!==(m=d[c++]||``)&&(f=parseFloat(m)||0,y=m.substr((f+``).length),h.charAt(1)===`=`&&(h=Tf(f,h)+y),g=parseFloat(h),v=h.substr((g+``).length),s=Ud.lastIndex-v.length,v||(v=v||gd.units[t]||y,s===r.length&&(r+=v,o.e+=v)),y!==v&&(f=Xh(e,t,m,v)||0),o._pt={_next:o._pt,p:_||c===1?_:`,`,s:f,c:g-f,m:p&&p<4||t===`zIndex`?Math.round:0});o.c=s<r.length?r.substring(s,r.length):``}else o.r=t===`display`&&r===`none`?Ch:Sh;return Gd.test(r)&&(o.e=0),this._pt=o,o},$h={top:`0%`,bottom:`100%`,left:`0%`,right:`100%`,center:`50%`},eg=function(e){var t=e.split(` `),n=t[0],r=t[1]||`50%`;return(n===`top`||n===`bottom`||r===`left`||r===`right`)&&(e=n,n=r,r=e),t[0]=$h[n]||n,t[1]=$h[r]||r,t.join(` `)},tg=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var n=t.t,r=n.style,i=t.u,a=n._gsap,o,s,c;if(i===`all`||i===!0)r.cssText=``,s=1;else for(i=i.split(`,`),c=i.length;--c>-1;)o=i[c],ch[o]&&(s=1,o=o===`transformOrigin`?jh:Ah),Kh(n,o);s&&(Kh(n,Ah),a&&(a.svg&&n.removeAttribute(`transform`),r.scale=r.rotate=r.translate=`none`,lg(n,1),a.uncache=1,Nh(r)))}},ng={clearProps:function(e,t,n,r,i){if(i.data!==`isFromStart`){var a=e._pt=new zm(e._pt,t,n,0,0,tg);return a.u=r,a.pr=-10,a.tween=i,e._props.push(n),1}}},rg=[1,0,0,1,0,0],ig={},ag=function(e){return e===`matrix(1, 0, 0, 1, 0, 0)`||e===`none`||!e},og=function(e){var t=Rh(e,Ah);return ag(t)?rg:t.substr(7).match(Hd).map(Cf)},sg=function(e,t){var n=e._gsap||bf(e),r=e.style,i=og(e),a,o,s,c;return n.svg&&e.getAttribute(`transform`)?(s=e.transform.baseVal.consolidate().matrix,i=[s.a,s.b,s.c,s.d,s.e,s.f],i.join(`,`)===`1,0,0,1,0,0`?rg:i):(i===rg&&!e.offsetParent&&e!==nh&&!n.svg&&(s=r.display,r.display=`block`,a=e.parentNode,(!a||!e.offsetParent&&!e.getBoundingClientRect().width)&&(c=1,o=e.nextElementSibling,nh.appendChild(e)),i=og(e),s?r.display=s:Kh(e,`display`),c&&(o?a.insertBefore(e,o):a?a.appendChild(e):nh.removeChild(e))),t&&i.length>6?[i[0],i[1],i[4],i[5],i[12],i[13]]:i)},cg=function(e,t,n,r,i,a){var o=e._gsap,s=i||sg(e,!0),c=o.xOrigin||0,l=o.yOrigin||0,u=o.xOffset||0,d=o.yOffset||0,f=s[0],p=s[1],m=s[2],h=s[3],g=s[4],_=s[5],v=t.split(` `),y=parseFloat(v[0])||0,b=parseFloat(v[1])||0,x,S,C,w;n?s!==rg&&(S=f*h-p*m)&&(C=h/S*y+b*(-m/S)+(m*_-h*g)/S,w=y*(-p/S)+f/S*b-(f*_-p*g)/S,y=C,b=w):(x=Wh(e),y=x.x+(~v[0].indexOf(`%`)?y/100*x.width:y),b=x.y+(~(v[1]||v[0]).indexOf(`%`)?b/100*x.height:b)),r||r!==!1&&o.smooth?(g=y-c,_=b-l,o.xOffset=u+(g*f+_*m)-g,o.yOffset=d+(g*p+_*h)-_):o.xOffset=o.yOffset=0,o.xOrigin=y,o.yOrigin=b,o.smooth=!!r,o.origin=t,o.originIsAbsolute=!!n,e.style[jh]=`0px 0px`,a&&(qh(a,o,`xOrigin`,c,y),qh(a,o,`yOrigin`,l,b),qh(a,o,`xOffset`,u,o.xOffset),qh(a,o,`yOffset`,d,o.yOffset)),e.setAttribute(`data-svg-origin`,y+` `+b)},lg=function(e,t){var n=e._gsap||new lm(e);if(`x`in n&&!t&&!n.uncache)return n;var r=e.style,i=n.scaleX<0,a=`px`,o=`deg`,s=getComputedStyle(e),c=Rh(e,jh)||`0`,l=u=d=m=h=g=_=v=y=0,u,d,f=p=1,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,ee,te,ne;return n.svg=!!(e.getCTM&&Gh(e)),s.translate&&((s.translate!==`none`||s.scale!==`none`||s.rotate!==`none`)&&(r[Ah]=(s.translate===`none`?``:`translate3d(`+(s.translate+` 0 0`).split(` `).slice(0,3).join(`, `)+`) `)+(s.rotate===`none`?``:`rotate(`+s.rotate+`) `)+(s.scale===`none`?``:`scale(`+s.scale.split(` `).join(`,`)+`) `)+(s[Ah]===`none`?``:s[Ah])),r.scale=r.rotate=r.translate=`none`),S=sg(e,n.svg),n.svg&&(n.uncache?(N=e.getBBox(),c=n.xOrigin-N.x+`px `+(n.yOrigin-N.y)+`px`,M=``):M=!t&&e.getAttribute(`data-svg-origin`),cg(e,M||c,!!M||n.originIsAbsolute,n.smooth!==!1,S)),b=n.xOrigin||0,x=n.yOrigin||0,S!==rg&&(E=S[0],D=S[1],O=S[2],k=S[3],l=A=S[4],u=j=S[5],S.length===6?(f=Math.sqrt(E*E+D*D),p=Math.sqrt(k*k+O*O),m=E||D?dh(D,E)*lh:0,_=O||k?dh(O,k)*lh+m:0,_&&(p*=Math.abs(Math.cos(_*uh))),n.svg&&(l-=b-(b*E+x*O),u-=x-(b*D+x*k))):(ne=S[6],ee=S[7],F=S[8],I=S[9],L=S[10],te=S[11],l=S[12],u=S[13],d=S[14],C=dh(ne,L),h=C*lh,C&&(w=Math.cos(-C),T=Math.sin(-C),M=A*w+F*T,N=j*w+I*T,P=ne*w+L*T,F=A*-T+F*w,I=j*-T+I*w,L=ne*-T+L*w,te=ee*-T+te*w,A=M,j=N,ne=P),C=dh(-O,L),g=C*lh,C&&(w=Math.cos(-C),T=Math.sin(-C),M=E*w-F*T,N=D*w-I*T,P=O*w-L*T,te=k*T+te*w,E=M,D=N,O=P),C=dh(D,E),m=C*lh,C&&(w=Math.cos(C),T=Math.sin(C),M=E*w+D*T,N=A*w+j*T,D=D*w-E*T,j=j*w-A*T,E=M,A=N),h&&Math.abs(h)+Math.abs(m)>359.9&&(h=m=0,g=180-g),f=Cf(Math.sqrt(E*E+D*D+O*O)),p=Cf(Math.sqrt(j*j+ne*ne)),C=dh(A,j),_=Math.abs(C)>2e-4?C*lh:0,y=te?1/(te<0?-te:te):0),n.svg&&(M=e.getAttribute(`transform`),n.forceCSS=e.setAttribute(`transform`,``)||!ag(Rh(e,Ah)),M&&e.setAttribute(`transform`,M))),Math.abs(_)>90&&Math.abs(_)<270&&(i?(f*=-1,_+=m<=0?180:-180,m+=m<=0?180:-180):(p*=-1,_+=_<=0?180:-180)),t||=n.uncache,n.x=l-((n.xPercent=l&&(!t&&n.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-l)?-50:0)))?e.offsetWidth*n.xPercent/100:0)+a,n.y=u-((n.yPercent=u&&(!t&&n.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-u)?-50:0)))?e.offsetHeight*n.yPercent/100:0)+a,n.z=d+a,n.scaleX=Cf(f),n.scaleY=Cf(p),n.rotation=Cf(m)+o,n.rotationX=Cf(h)+o,n.rotationY=Cf(g)+o,n.skewX=_+o,n.skewY=v+o,n.transformPerspective=y+a,(n.zOrigin=parseFloat(c.split(` `)[2])||!t&&n.zOrigin||0)&&(r[jh]=ug(c)),n.xOffset=n.yOffset=0,n.force3D=gd.force3D,n.renderTransform=n.svg?_g:Ih?gg:fg,n.uncache=0,n},ug=function(e){return(e=e.split(` `))[0]+` `+e[1]},dg=function(e,t,n){var r=fp(t);return Cf(parseFloat(t)+parseFloat(Xh(e,`x`,n+`px`,r)))+r},fg=function(e,t){t.z=`0px`,t.rotationY=t.rotationX=`0deg`,t.force3D=0,gg(e,t)},pg=`0deg`,mg=`0px`,hg=`) `,gg=function(e,t){var n=t||this,r=n.xPercent,i=n.yPercent,a=n.x,o=n.y,s=n.z,c=n.rotation,l=n.rotationY,u=n.rotationX,d=n.skewX,f=n.skewY,p=n.scaleX,m=n.scaleY,h=n.transformPerspective,g=n.force3D,_=n.target,v=n.zOrigin,y=``,b=g===`auto`&&e&&e!==1||g===!0;if(v&&(u!==pg||l!==pg)){var x=parseFloat(l)*uh,S=Math.sin(x),C=Math.cos(x),w;x=parseFloat(u)*uh,w=Math.cos(x),a=dg(_,a,S*w*-v),o=dg(_,o,-Math.sin(x)*-v),s=dg(_,s,C*w*-v+v)}h!==mg&&(y+=`perspective(`+h+hg),(r||i)&&(y+=`translate(`+r+`%, `+i+`%) `),(b||a!==mg||o!==mg||s!==mg)&&(y+=s!==mg||b?`translate3d(`+a+`, `+o+`, `+s+`) `:`translate(`+a+`, `+o+hg),c!==pg&&(y+=`rotate(`+c+hg),l!==pg&&(y+=`rotateY(`+l+hg),u!==pg&&(y+=`rotateX(`+u+hg),(d!==pg||f!==pg)&&(y+=`skew(`+d+`, `+f+hg),(p!==1||m!==1)&&(y+=`scale(`+p+`, `+m+hg),_.style[Ah]=y||`translate(0, 0)`},_g=function(e,t){var n=t||this,r=n.xPercent,i=n.yPercent,a=n.x,o=n.y,s=n.rotation,c=n.skewX,l=n.skewY,u=n.scaleX,d=n.scaleY,f=n.target,p=n.xOrigin,m=n.yOrigin,h=n.xOffset,g=n.yOffset,_=n.forceCSS,v=parseFloat(a),y=parseFloat(o),b,x,S,C,w;s=parseFloat(s),c=parseFloat(c),l=parseFloat(l),l&&(l=parseFloat(l),c+=l,s+=l),s||c?(s*=uh,c*=uh,b=Math.cos(s)*u,x=Math.sin(s)*u,S=Math.sin(s-c)*-d,C=Math.cos(s-c)*d,c&&(l*=uh,w=Math.tan(c-l),w=Math.sqrt(1+w*w),S*=w,C*=w,l&&(w=Math.tan(l),w=Math.sqrt(1+w*w),b*=w,x*=w)),b=Cf(b),x=Cf(x),S=Cf(S),C=Cf(C)):(b=u,C=d,x=S=0),(v&&!~(a+``).indexOf(`px`)||y&&!~(o+``).indexOf(`px`))&&(v=Xh(f,`x`,a,`px`),y=Xh(f,`y`,o,`px`)),(p||m||h||g)&&(v=Cf(v+p-(p*b+m*S)+h),y=Cf(y+m-(p*x+m*C)+g)),(r||i)&&(w=f.getBBox(),v=Cf(v+r/100*w.width),y=Cf(y+i/100*w.height)),w=`matrix(`+b+`,`+x+`,`+S+`,`+C+`,`+v+`,`+y+`)`,f.setAttribute(`transform`,w),_&&(f.style[Ah]=w)},vg=function(e,t,n,r,i){var a=360,o=kd(i),s=parseFloat(i)*(o&&~i.indexOf(`rad`)?lh:1)-r,c=r+s+`deg`,l,u;return o&&(l=i.split(`_`)[1],l===`short`&&(s%=a,s!==s%(a/2)&&(s+=s<0?a:-a)),l===`cw`&&s<0?s=(s+a*fh)%a-~~(s/a)*a:l===`ccw`&&s>0&&(s=(s-a*fh)%a-~~(s/a)*a)),e._pt=u=new zm(e._pt,t,n,r,s,vh),u.e=c,u.u=`deg`,e._props.push(n),u},yg=function(e,t){for(var n in t)e[n]=t[n];return e},bg=function(e,t,n){var r=yg({},n._gsap),i=`perspective,force3D,transformOrigin,svgOrigin`,a=n.style,o,s,c,l,u,d,f,p;for(s in r.svg?(c=n.getAttribute(`transform`),n.setAttribute(`transform`,``),a[Ah]=t,o=lg(n,1),Kh(n,Ah),n.setAttribute(`transform`,c)):(c=getComputedStyle(n)[Ah],a[Ah]=t,o=lg(n,1),a[Ah]=c),ch)c=r[s],l=o[s],c!==l&&i.indexOf(s)<0&&(f=fp(c),p=fp(l),u=f===p?parseFloat(c):Xh(n,s,c,p),d=parseFloat(l),e._pt=new zm(e._pt,o,s,u,d-u,_h),e._pt.u=p||0,e._props.push(s));yg(o,r)};Sf(`padding,margin,Width,Radius`,function(e,t){var n=`Top`,r=`Right`,i=`Bottom`,a=`Left`,o=(t<3?[n,r,i,a]:[n+a,n+r,i+r,i+a]).map(function(n){return t<2?e+n:`border`+n+e});ng[t>1?`border`+e:e]=function(e,t,n,r,i){var a,s;if(arguments.length<4)return a=o.map(function(t){return Zh(e,t,n)}),s=a.join(` `),s.split(a[0]).length===5?a[0]:s;a=(r+``).split(` `),s={},o.forEach(function(e,t){return s[e]=a[t]=a[t]||a[(t-1)/2|0]}),e.init(t,s,i)}});var xg={name:`css`,register:Vh,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,n,r,i){var a=this._props,o=e.style,s=n.vars.startAt,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;for(m in rh||Vh(),this.styles=this.styles||Fh(e),C=this.styles.props,this.tween=n,t)if(m!==`autoRound`&&(l=t[m],!(mf[m]&&hm(m,t,n,r,e,i)))){if(f=typeof l,p=ng[m],f===`function`&&(l=l.call(n,r,e,i),f=typeof l),f===`string`&&~l.indexOf(`random(`)&&(l=Ap(l)),p)p(this,e,m,l,n)&&(S=1);else if(m.substr(0,2)===`--`)c=(getComputedStyle(e).getPropertyValue(m)+``).trim(),l+=``,Gp.lastIndex=0,Gp.test(c)||(h=fp(c),g=fp(l),g?h!==g&&(c=Xh(e,m,c,g)+g):h&&(l+=h)),this.add(o,`setProperty`,c,l,r,i,0,0,m),a.push(m),C.push(m,0,o[m]);else if(f!==`undefined`){if(s&&m in s?(c=typeof s[m]==`function`?s[m].call(n,r,e,i):s[m],kd(c)&&~c.indexOf(`random(`)&&(c=Ap(c)),fp(c+``)||c===`auto`||(c+=gd.units[m]||fp(Zh(e,m))||``),(c+``).charAt(1)===`=`&&(c=Zh(e,m))):c=Zh(e,m),d=parseFloat(c),_=f===`string`&&l.charAt(1)===`=`&&l.substr(0,2),_&&(l=l.substr(2)),u=parseFloat(l),m in gh&&(m===`autoAlpha`&&(d===1&&Zh(e,`visibility`)===`hidden`&&u&&(d=0),C.push(`visibility`,0,o.visibility),qh(this,o,`visibility`,d?`inherit`:`hidden`,u?`inherit`:`hidden`,!u)),m!==`scale`&&m!==`transform`&&(m=gh[m],~m.indexOf(`,`)&&(m=m.split(`,`)[0]))),v=m in ch,v){if(this.styles.save(m),w=l,f===`string`&&l.substring(0,6)===`var(--`){if(l=Rh(e,l.substring(4,l.indexOf(`)`))),l.substring(0,5)===`calc(`){var T=e.style.perspective;e.style.perspective=l,l=Rh(e,`perspective`),T?e.style.perspective=T:Kh(e,`perspective`)}u=parseFloat(l)}if(y||(b=e._gsap,b.renderTransform&&!t.parseTransform||lg(e,t.parseTransform),x=t.smoothOrigin!==!1&&b.smooth,y=this._pt=new zm(this._pt,o,Ah,0,1,b.renderTransform,b,0,-1),y.dep=1),m===`scale`)this._pt=new zm(this._pt,b,`scaleY`,b.scaleY,(_?Tf(b.scaleY,_+u):u)-b.scaleY||0,_h),this._pt.u=0,a.push(`scaleY`,m),m+=`X`;else if(m===`transformOrigin`){C.push(jh,0,o[jh]),l=eg(l),b.svg?cg(e,l,0,x,0,this):(g=parseFloat(l.split(` `)[2])||0,g!==b.zOrigin&&qh(this,b,`zOrigin`,b.zOrigin,g),qh(this,o,m,ug(c),ug(l)));continue}else if(m===`svgOrigin`){cg(e,l,1,x,0,this);continue}else if(m in ig){vg(this,b,m,d,_?Tf(d,_+l):l);continue}else if(m===`smoothOrigin`){qh(this,b,`smooth`,b.smooth,l);continue}else if(m===`force3D`){b[m]=l;continue}else if(m===`transform`){bg(this,l,e);continue}}else m in o||(m=Bh(m)||m);if(v||(u||u===0)&&(d||d===0)&&!hh.test(l)&&m in o)h=(c+``).substr((d+``).length),u||=0,g=fp(l)||(m in gd.units?gd.units[m]:h),h!==g&&(d=Xh(e,m,c,g)),this._pt=new zm(this._pt,v?b:o,m,d,(_?Tf(d,_+u):u)-d,!v&&(g===`px`||m===`zIndex`)&&t.autoRound!==!1?xh:_h),this._pt.u=g||0,v&&w!==l?(this._pt.b=c,this._pt.e=w,this._pt.r=bh):h!==g&&g!==`%`&&(this._pt.b=c,this._pt.r=yh);else if(m in o)Qh.call(this,e,m,c,_?_+l:l);else if(m in e)this.add(e,m,c||e[m],_?_+l:l,r,i);else if(m!==`parseTransform`){nf(m,l);continue}v||(m in o?C.push(m,0,o[m]):typeof e[m]==`function`?C.push(m,2,e[m]()):C.push(m,1,c||e[m])),a.push(m)}}S&&Rm(this)},render:function(e,t){if(t.tween._time||!oh())for(var n=t._pt;n;)n.r(e,n.d),n=n._next;else t.styles.revert()},get:Zh,aliases:gh,getSetter:function(e,t,n){var r=gh[t];return r&&r.indexOf(`,`)<0&&(t=r),t in ch&&t!==jh&&(e._gsap.x||Zh(e,`x`))?n&&ah===n?t===`scale`?Dh:Eh:(ah=n||{})&&(t===`scale`?Oh:kh):e.style&&!Md(e.style[t])?wh:~t.indexOf(`-`)?Th:Am(e,t)},core:{_removeProperty:Kh,_getMatrix:sg}};$m.utils.checkPrefix=Bh,$m.core.getStyleSaver=Fh,(function(e,t,n,r){var i=Sf(e+`,`+t+`,`+n,function(e){ch[e]=1});Sf(t,function(e){gd.units[e]=`deg`,ig[e]=1}),gh[i[13]]=e+`,`+t,Sf(r,function(e){var t=e.split(`:`);gh[t[1]]=i[t[0]]})})(`x,y,z,scale,scaleX,scaleY,xPercent,yPercent`,`rotation,rotationX,rotationY,skewX,skewY`,`transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective`,`0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY`),Sf(`x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective`,function(e){gd.units[e]=`px`}),$m.registerPlugin(xg);var Sg=$m.registerPlugin(xg)||$m;Sg.core.Tween;var Cg={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},wg=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Tg=new Cs(-1,1,1,-1,0,1),Eg=new class extends Bi{constructor(){super(),this.setAttribute(`position`,new Oi([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new Oi([0,2,0,0,2,0],2))}},Dg=class{constructor(e){this._mesh=new Q(Eg,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Tg)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Og=class extends wg{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Po?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=jo.clone(e.uniforms),this.material=new Po({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Dg(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},kg=class extends wg{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},Ag=class extends wg{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},jg=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new Y);this._width=n.width,this._height=n.height,t=new or(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ve}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Og(Cg),this.copyPass.material.blending=0,this.timer=new As}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}kg!==void 0&&(r instanceof kg?n=!0:r instanceof Ag&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new Y);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},Mg=class extends wg{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Z}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},Ng={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Z(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},Pg=class e extends wg{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new Y(256,256):new Y(e.x,e.y),this.clearColor=new Z(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new or(i,a,{type:Ve,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new or(i,a,{type:Ve,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new or(i,a,{type:Ve,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=Ng;this.highPassUniforms=jo.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Po({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new Y(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new X(1,1,1),new X(1,1,1),new X(1,1,1),new X(1,1,1),new X(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=jo.clone(Cg.uniforms),this.blendMaterial=new Po({uniforms:this.copyUniforms,vertexShader:Cg.vertexShader,fragmentShader:Cg.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Z,this._oldClearAlpha=1,this._basic=new _a,this._fsQuad=new Dg(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new Y(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new Po({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new Y(.5,.5)},direction:{value:new Y(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Po({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Pg.BlurDirectionX=new Y(1,0),Pg.BlurDirectionY=new Y(0,1);var Fg={};(function e(t,n,r,i){var a=!!(t.Worker&&t.Blob&&t.Promise&&t.OffscreenCanvas&&t.OffscreenCanvasRenderingContext2D&&t.HTMLCanvasElement&&t.HTMLCanvasElement.prototype.transferControlToOffscreen&&t.URL&&t.URL.createObjectURL),o=typeof Path2D==`function`&&typeof DOMMatrix==`function`,s=(function(){if(!t.OffscreenCanvas)return!1;try{var e=new OffscreenCanvas(1,1),n=e.getContext(`2d`);n.fillRect(0,0,1,1);var r=e.transferToImageBitmap();n.createPattern(r,`no-repeat`)}catch{return!1}return!0})();function c(){}function l(e){var r=n.exports.Promise,i=r===void 0?t.Promise:r;return typeof i==`function`?new i(e):(e(c,c),null)}var u=(function(e,t){return{transform:function(n){if(e)return n;if(t.has(n))return t.get(n);var r=new OffscreenCanvas(n.width,n.height);return r.getContext(`2d`).drawImage(n,0,0),t.set(n,r),r},clear:function(){t.clear()}}})(s,new Map),d=function(){var e,t,n={},r=0;return typeof requestAnimationFrame==`function`&&typeof cancelAnimationFrame==`function`?(e=function(e){var t=Math.random();return n[t]=requestAnimationFrame(function i(a){r===a||r+16-1<a?(r=a,delete n[t],e()):n[t]=requestAnimationFrame(i)}),t},t=function(e){n[e]&&cancelAnimationFrame(n[e])}):(e=function(e){return setTimeout(e,16)},t=function(e){return clearTimeout(e)}),{frame:e,cancel:t}}(),f=(function(){var t,n,i={};function o(e){function t(t,n){e.postMessage({options:t||{},callback:n})}e.init=function(t){var n=t.transferControlToOffscreen();e.postMessage({canvas:n},[n])},e.fire=function(r,a,o){if(n)return t(r,null),n;var s=Math.random().toString(36).slice(2);return n=l(function(a){function c(t){t.data.callback===s&&(delete i[s],e.removeEventListener(`message`,c),n=null,u.clear(),o(),a())}e.addEventListener(`message`,c),t(r,s),i[s]=c.bind(null,{data:{callback:s}})}),n},e.reset=function(){for(var t in e.postMessage({reset:!0}),i)i[t](),delete i[t]}}return function(){if(t)return t;if(!r&&a){var n=[`var CONFETTI, SIZE = {}, module = {};`,`(`+e.toString()+`)(this, module, true, SIZE);`,`onmessage = function(msg) {`,`  if (msg.data.options) {`,`    CONFETTI(msg.data.options).then(function () {`,`      if (msg.data.callback) {`,`        postMessage({ callback: msg.data.callback });`,`      }`,`    });`,`  } else if (msg.data.reset) {`,`    CONFETTI && CONFETTI.reset();`,`  } else if (msg.data.resize) {`,`    SIZE.width = msg.data.resize.width;`,`    SIZE.height = msg.data.resize.height;`,`  } else if (msg.data.canvas) {`,`    SIZE.width = msg.data.canvas.width;`,`    SIZE.height = msg.data.canvas.height;`,`    CONFETTI = module.exports.create(msg.data.canvas);`,`  }`,`}`].join(`
`);try{t=new Worker(URL.createObjectURL(new Blob([n])))}catch(e){return typeof console<`u`&&typeof console.warn==`function`&&console.warn(`🎊 Could not load worker`,e),null}o(t)}return t}})(),p={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:[`square`,`circle`],zIndex:100,colors:[`#26ccff`,`#a25afd`,`#ff5e7e`,`#88ff5a`,`#fcff42`,`#ffa62d`,`#ff36ff`],disableForReducedMotion:!1,scalar:1};function m(e,t){return t?t(e):e}function h(e){return e!=null}function g(e,t,n){return m(e&&h(e[t])?e[t]:p[t],n)}function _(e){return e<0?0:Math.floor(e)}function v(e,t){return Math.floor(Math.random()*(t-e))+e}function y(e){return parseInt(e,16)}function b(e){return e.map(x)}function x(e){var t=String(e).replace(/[^0-9a-f]/gi,``);return t.length<6&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]),{r:y(t.substring(0,2)),g:y(t.substring(2,4)),b:y(t.substring(4,6))}}function S(e){var t=g(e,`origin`,Object);return t.x=g(t,`x`,Number),t.y=g(t,`y`,Number),t}function C(e){e.width=document.documentElement.clientWidth,e.height=document.documentElement.clientHeight}function w(e){var t=e.getBoundingClientRect();e.width=t.width,e.height=t.height}function T(e){var t=document.createElement(`canvas`);return t.style.position=`fixed`,t.style.top=`0px`,t.style.left=`0px`,t.style.pointerEvents=`none`,t.style.zIndex=e,t}function E(e,t,n,r,i,a,o,s,c){e.save(),e.translate(t,n),e.rotate(a),e.scale(r,i),e.arc(0,0,1,o,s,c),e.restore()}function D(e){var t=e.angle*(Math.PI/180),n=e.spread*(Math.PI/180);return{x:e.x,y:e.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:e.startVelocity*.5+Math.random()*e.startVelocity,angle2D:-t+(.5*n-Math.random()*n),tiltAngle:(Math.random()*.5+.25)*Math.PI,color:e.color,shape:e.shape,tick:0,totalTicks:e.ticks,decay:e.decay,drift:e.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:e.gravity*3,ovalScalar:.6,scalar:e.scalar,flat:e.flat}}function O(e,t){t.x+=Math.cos(t.angle2D)*t.velocity+t.drift,t.y+=Math.sin(t.angle2D)*t.velocity+t.gravity,t.velocity*=t.decay,t.flat?(t.wobble=0,t.wobbleX=t.x+10*t.scalar,t.wobbleY=t.y+10*t.scalar,t.tiltSin=0,t.tiltCos=0,t.random=1):(t.wobble+=t.wobbleSpeed,t.wobbleX=t.x+10*t.scalar*Math.cos(t.wobble),t.wobbleY=t.y+10*t.scalar*Math.sin(t.wobble),t.tiltAngle+=.1,t.tiltSin=Math.sin(t.tiltAngle),t.tiltCos=Math.cos(t.tiltAngle),t.random=Math.random()+2);var n=t.tick++/t.totalTicks,r=t.x+t.random*t.tiltCos,i=t.y+t.random*t.tiltSin,a=t.wobbleX+t.random*t.tiltCos,s=t.wobbleY+t.random*t.tiltSin;if(e.fillStyle=`rgba(`+t.color.r+`, `+t.color.g+`, `+t.color.b+`, `+(1-n)+`)`,e.beginPath(),o&&t.shape.type===`path`&&typeof t.shape.path==`string`&&Array.isArray(t.shape.matrix))e.fill(N(t.shape.path,t.shape.matrix,t.x,t.y,Math.abs(a-r)*.1,Math.abs(s-i)*.1,Math.PI/10*t.wobble));else if(t.shape.type===`bitmap`){var c=Math.PI/10*t.wobble,l=Math.abs(a-r)*.1,d=Math.abs(s-i)*.1,f=t.shape.bitmap.width*t.scalar,p=t.shape.bitmap.height*t.scalar,m=new DOMMatrix([Math.cos(c)*l,Math.sin(c)*l,-Math.sin(c)*d,Math.cos(c)*d,t.x,t.y]);m.multiplySelf(new DOMMatrix(t.shape.matrix));var h=e.createPattern(u.transform(t.shape.bitmap),`no-repeat`);h.setTransform(m),e.globalAlpha=1-n,e.fillStyle=h,e.fillRect(t.x-f/2,t.y-p/2,f,p),e.globalAlpha=1}else if(t.shape===`circle`)e.ellipse?e.ellipse(t.x,t.y,Math.abs(a-r)*t.ovalScalar,Math.abs(s-i)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI):E(e,t.x,t.y,Math.abs(a-r)*t.ovalScalar,Math.abs(s-i)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI);else if(t.shape===`star`)for(var g=Math.PI/2*3,_=4*t.scalar,v=8*t.scalar,y=t.x,b=t.y,x=5,S=Math.PI/x;x--;)y=t.x+Math.cos(g)*v,b=t.y+Math.sin(g)*v,e.lineTo(y,b),g+=S,y=t.x+Math.cos(g)*_,b=t.y+Math.sin(g)*_,e.lineTo(y,b),g+=S;else e.moveTo(Math.floor(t.x),Math.floor(t.y)),e.lineTo(Math.floor(t.wobbleX),Math.floor(i)),e.lineTo(Math.floor(a),Math.floor(s)),e.lineTo(Math.floor(r),Math.floor(t.wobbleY));return e.closePath(),e.fill(),t.tick<t.totalTicks}function k(e,t,n,a,o){var s=t.slice(),c=e.getContext(`2d`),f,p,m=l(function(t){function l(){f=p=null,c.clearRect(0,0,a.width,a.height),u.clear(),o(),t()}function m(){r&&(a.width!==i.width||a.height!==i.height)&&(a.width=e.width=i.width,a.height=e.height=i.height),!a.width&&!a.height&&(n(e),a.width=e.width,a.height=e.height),c.clearRect(0,0,a.width,a.height),s=s.filter(function(e){return O(c,e)}),s.length?f=d.frame(m):l()}f=d.frame(m),p=l});return{addFettis:function(e){return s=s.concat(e),m},canvas:e,promise:m,reset:function(){f&&d.cancel(f),p&&p()}}}function A(e,n){var r=!e,i=!!g(n||{},`resize`),o=!1,s=g(n,`disableForReducedMotion`,Boolean),c=a&&g(n||{},`useWorker`)?f():null,u=r?C:w,d=e&&c?!!e.__confetti_initialized:!1,p=typeof matchMedia==`function`&&matchMedia(`(prefers-reduced-motion)`).matches,m;function h(t,n,r){for(var i=g(t,`particleCount`,_),a=g(t,`angle`,Number),o=g(t,`spread`,Number),s=g(t,`startVelocity`,Number),c=g(t,`decay`,Number),l=g(t,`gravity`,Number),d=g(t,`drift`,Number),f=g(t,`colors`,b),p=g(t,`ticks`,Number),h=g(t,`shapes`),y=g(t,`scalar`),x=!!g(t,`flat`),C=S(t),w=i,T=[],E=e.width*C.x,O=e.height*C.y;w--;)T.push(D({x:E,y:O,angle:a,spread:o,startVelocity:s,color:f[w%f.length],shape:h[v(0,h.length)],ticks:p,decay:c,gravity:l,drift:d,scalar:y,flat:x}));return m?m.addFettis(T):(m=k(e,T,u,n,r),m.promise)}function y(n){var a=s||g(n,`disableForReducedMotion`,Boolean),f=g(n,`zIndex`,Number);if(a&&p)return l(function(e){e()});r&&m?e=m.canvas:r&&!e&&(e=T(f),document.body.appendChild(e)),i&&!d&&u(e);var _={width:e.width,height:e.height};c&&!d&&c.init(e),d=!0,c&&(e.__confetti_initialized=!0);function v(){if(c){var t={getBoundingClientRect:function(){if(!r)return e.getBoundingClientRect()}};u(t),c.postMessage({resize:{width:t.width,height:t.height}})}else _.width=_.height=null}function y(){m=null,i&&(o=!1,t.removeEventListener(`resize`,v)),r&&e&&(document.body.contains(e)&&document.body.removeChild(e),e=null,d=!1)}return i&&!o&&(o=!0,t.addEventListener(`resize`,v,!1)),c?c.fire(n,_,y):h(n,_,y)}return y.reset=function(){c&&c.reset(),m&&m.reset()},y}var j;function M(){return j||=A(null,{useWorker:!0,resize:!0}),j}function N(e,t,n,r,i,a,o){var s=new Path2D(e),c=new Path2D;c.addPath(s,new DOMMatrix(t));var l=new Path2D;return l.addPath(c,new DOMMatrix([Math.cos(o)*i,Math.sin(o)*i,-Math.sin(o)*a,Math.cos(o)*a,n,r])),l}function P(e){if(!o)throw Error(`path confetti are not supported in this browser`);var t,n;typeof e==`string`?t=e:(t=e.path,n=e.matrix);var r=new Path2D(t),i=document.createElement(`canvas`).getContext(`2d`);if(!n){for(var a=1e3,s=a,c=a,l=0,u=0,d,f,p=0;p<a;p+=2)for(var m=0;m<a;m+=2)i.isPointInPath(r,p,m,`nonzero`)&&(s=Math.min(s,p),c=Math.min(c,m),l=Math.max(l,p),u=Math.max(u,m));d=l-s,f=u-c;var h=10,g=Math.min(h/d,h/f);n=[g,0,0,g,-Math.round(d/2+s)*g,-Math.round(f/2+c)*g]}return{type:`path`,path:t,matrix:n}}function F(e){var t,n=1,r=`#000000`,i=`"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif`;typeof e==`string`?t=e:(t=e.text,n=`scalar`in e?e.scalar:n,i=`fontFamily`in e?e.fontFamily:i,r=`color`in e?e.color:r);var a=10*n,o=``+a+`px `+i,s=new OffscreenCanvas(a,a),c=s.getContext(`2d`);c.font=o;var l=c.measureText(t),u=Math.ceil(l.actualBoundingBoxRight+l.actualBoundingBoxLeft),d=Math.ceil(l.actualBoundingBoxAscent+l.actualBoundingBoxDescent),f=2,p=l.actualBoundingBoxLeft+f,m=l.actualBoundingBoxAscent+f;u+=f+f,d+=f+f,s=new OffscreenCanvas(u,d),c=s.getContext(`2d`),c.font=o,c.fillStyle=r,c.fillText(t,p,m);var h=1/n;return{type:`bitmap`,bitmap:s.transferToImageBitmap(),matrix:[h,0,0,h,-u*h/2,-d*h/2]}}n.exports=function(){return M().apply(this,arguments)},n.exports.reset=function(){M().reset()},n.exports.create=A,n.exports.shapeFromPath=P,n.exports.shapeFromText=F})((function(){return typeof window<`u`?window:typeof self<`u`?self:this||{}})(),Fg,!1);var Ig=Fg.exports;Fg.exports.create;var Lg=new Uint8Array(512),Rg=new Float32Array(256),zg=new Float32Array(256);(()=>{let e=1337420,t=new Uint8Array(256);for(let e=0;e<256;e++)t[e]=e;for(let n=255;n>0;n--){e=e*1664525+1013904223>>>0;let r=e%(n+1),i=t[n];t[n]=t[r],t[r]=i}for(let e=0;e<512;e++)Lg[e]=t[e&255];for(let e=0;e<256;e++){let t=e/256*Math.PI*2;Rg[e]=Math.cos(t),zg[e]=Math.sin(t)}})();function Bg(e){return e*e*e*(e*(e*6-15)+10)}function Vg(e,t,n){return e+n*(t-e)}function Hg(e,t,n=256,r=256){let i=Math.floor(e),a=Math.floor(t),o=e-i,s=t-a,c=(i%n+n)%n&255,l=(a%r+r)%r&255,u=((i+1)%n+n)%n&255,d=((a+1)%r+r)%r&255,f=Bg(o),p=Bg(s),m=Lg[c+Lg[l]],h=Lg[u+Lg[l]],g=Lg[c+Lg[d]],_=Lg[u+Lg[d]],v=Rg[m]*o+zg[m]*s,y=Rg[h]*(o-1)+zg[h]*s,b=Rg[g]*o+zg[g]*(s-1),x=Rg[_]*(o-1)+zg[_]*(s-1);return Vg(Vg(v,y,f),Vg(b,x,f),p)}function Ug(e,t,n=5,r=2,i=.5,a=256,o=256){let s=0,c=.5,l=1,u=0;for(let d=0;d<n;d++)s+=c*Hg(e*l,t*l,Math.round(a*l),Math.round(o*l)),u+=c,c*=i,l*=r;return J.clamp(s/u*.5+.5,0,1)}function Wg(e,t,n=5,r=256,i=256){let a=0,o=.5,s=1,c=1,l=0;for(let u=0;u<n;u++){let n=1-Math.abs(Hg(e*s,t*s,Math.round(r*s),Math.round(i*s)));n=n*n*c,c=J.clamp(n*2,0,1),a+=n*o,l+=o,o*=.5,s*=2.05}return J.clamp(a/l,0,1)}function Gg(){let e=document.createElement(`canvas`);e.width=512,e.height=512;let t=e.getContext(`2d`),n=t.createLinearGradient(0,0,512,512);n.addColorStop(0,`#f8fafc`),n.addColorStop(.5,`#e2e8f0`),n.addColorStop(1,`#cbd5e1`),t.fillStyle=n,t.fillRect(0,0,512,512),t.fillStyle=`rgba(0, 0, 0, 0.025)`;for(let e=0;e<512;e+=4)t.fillRect(0,e,512,1.5);for(let[e,n,r,i]of[[24,24,216,180],[272,24,216,180],[36,234,440,110],[48,368,196,120],[268,368,196,120]]){t.fillStyle=`#0f172a`,t.fillRect(e,n,r,i),t.fillStyle=`rgba(255, 255, 255, 0.04)`;for(let a=n+3;a<n+i-3;a+=4)t.fillRect(e+3,a,r-6,1.5);t.strokeStyle=`#1e293b`,t.lineWidth=3,t.strokeRect(e,n,r,i),t.strokeStyle=`rgba(0, 240, 255, 0.85)`,t.lineWidth=2,t.beginPath(),t.moveTo(e+8,n+2),t.lineTo(e+r-8,n+2),t.stroke()}t.fillStyle=`#0f172a`,t.font=`900 18px sans-serif`,t.fillText(`EXP-07`,38,52),t.fillText(`BYSANS`,384,52),t.strokeStyle=`#00f0ff`,t.lineWidth=3,t.beginPath(),t.moveTo(40,214),t.lineTo(160,214),t.lineTo(190,226),t.stroke(),t.beginPath(),t.moveTo(472,214),t.lineTo(352,214),t.lineTo(322,226),t.stroke();let r=document.createElement(`canvas`);r.width=512,r.height=256;let i=r.getContext(`2d`),a=i.createLinearGradient(0,0,512,256);a.addColorStop(0,`#06101e`),a.addColorStop(.5,`#0b1d35`),a.addColorStop(1,`#06101e`),i.fillStyle=a,i.fillRect(0,0,512,256),i.strokeStyle=`rgba(0, 240, 255, 0.45)`,i.lineWidth=2;for(let e=0;e<256;e+=42)for(let t=0;t<512;t+=28*Math.sqrt(3)){let n=t+Math.floor(e/42)%2*(28*Math.sqrt(3))/2;i.beginPath();for(let t=0;t<6;t++){let r=t*Math.PI/3,a=n+28*.55*Math.cos(r),o=e+28*.55*Math.sin(r);t===0?i.moveTo(a,o):i.lineTo(a,o)}i.closePath(),i.stroke()}i.fillStyle=`#0f172a`,i.fillRect(248,0,16,256),i.strokeStyle=`rgba(0, 240, 255, 0.85)`,i.lineWidth=2,i.strokeRect(248,0,16,256),i.fillStyle=`rgba(255, 255, 255, 0.08)`,i.beginPath(),i.moveTo(100,256),i.lineTo(210,0),i.lineTo(250,0),i.lineTo(140,256),i.closePath(),i.fill(),i.strokeStyle=`#050a14`,i.lineWidth=12,i.strokeRect(6,6,500,244);let o=document.createElement(`canvas`);o.width=256,o.height=256;let s=o.getContext(`2d`);s.fillStyle=`#808080`,s.fillRect(0,0,256,256),s.strokeStyle=`#ffffff`,s.lineWidth=3,s.strokeRect(10,10,236,236),s.strokeStyle=`#202020`,s.lineWidth=2,s.strokeRect(128,10,2,236);for(let e=24;e<232;e+=18)s.fillStyle=`#ffffff`,s.fillRect(24,e,56,5),s.fillRect(176,e,56,5);let c=document.createElement(`canvas`);c.width=256,c.height=256;let l=c.getContext(`2d`);l.fillStyle=`#9e9e9e`,l.fillRect(0,0,256,256);let u=document.createElement(`canvas`);u.width=256,u.height=256;let d=u.getContext(`2d`);d.fillStyle=`#090f1d`,d.fillRect(0,0,256,256);let f=document.createElement(`canvas`);f.width=128,f.height=128;let p=f.getContext(`2d`);p.fillStyle=`#808080`,p.fillRect(0,0,128,128);let m=document.createElement(`canvas`);m.width=128,m.height=128;let h=m.getContext(`2d`);h.fillStyle=`#03060d`,h.fillRect(0,0,128,128);let g=document.createElement(`canvas`);g.width=128,g.height=128;let _=g.getContext(`2d`);_.fillStyle=`#808080`,_.fillRect(0,0,128,128);let v=document.createElement(`canvas`);v.width=128,v.height=128;let y=v.getContext(`2d`);y.fillStyle=`#02050b`,y.fillRect(0,0,128,128);let b=document.createElement(`canvas`);b.width=512,b.height=512;let x=b.getContext(`2d`),S=x.createImageData(512,512),C=document.createElement(`canvas`);C.width=512,C.height=512;let w=C.getContext(`2d`),T=w.createImageData(512,512),E=document.createElement(`canvas`);E.width=512,E.height=512;let D=E.getContext(`2d`),O=D.createImageData(512,512),k=[];for(let e=0;e<85;e++)k.push({x:(e*197+43)%512,y:(e*131+79)%512,r:e<14?34+e%5*9:9+e%7*4,depth:.45+e%4*.14});for(let e=0;e<512;e++){let t=e/512*8;for(let n=0;n<512;n++){let r=n/512*8,i=Ug(r,t,6,2,.52,8,8),a=Wg(r*1.5+3.1,t*1.5+1.7,4,12,12),o=0;for(let t=0;t<k.length;t++){let r=k[t],i=Math.abs(n-r.x),a=Math.abs(e-r.y);i>256&&(i=512-i),a>256&&(a=512-a);let s=Math.sqrt(i*i+a*a)/r.r;if(s<1.35){if(s<.82){let e=s/.82*(s/.82)-1;o+=e*r.depth*.55}else{let e=(s-.82)/.53,t=Math.sin(e*Math.PI)*.28*r.depth;o+=t}}}let s=J.clamp(i*.62+(1-a)*.18+o+.15,0,1),c=26+s*58,l=28+s*54+(a>.82?18:0),u=32+s*60,d=(e*512+n)*4;S.data[d]=J.clamp(l,10,210),S.data[d+1]=J.clamp(c,10,210),S.data[d+2]=J.clamp(u,12,220),S.data[d+3]=255;let f=Math.round(s*255);T.data[d]=f,T.data[d+1]=f,T.data[d+2]=f,T.data[d+3]=255;let p=Math.round(J.clamp((1-s*.55)*235,65,245));O.data[d]=p,O.data[d+1]=p,O.data[d+2]=p,O.data[d+3]=255}}x.putImageData(S,0,0),w.putImageData(T,0,0),D.putImageData(O,0,0);let A=document.createElement(`canvas`);A.width=512,A.height=340;let j=A.getContext(`2d`);j.clearRect(0,0,512,340);let M=j.createLinearGradient(0,0,512,340);M.addColorStop(0,`rgba(56, 189, 248, 0.32)`),M.addColorStop(.5,`rgba(15, 23, 42, 0.54)`),M.addColorStop(1,`rgba(0, 240, 255, 0.36)`),j.fillStyle=M,j.fillRect(8,8,496,324),j.fillStyle=`rgba(255, 255, 255, 0.30)`,j.beginPath(),j.moveTo(70,332),j.lineTo(190,8),j.lineTo(245,8),j.lineTo(125,332),j.closePath(),j.fill(),j.fillStyle=`rgba(255, 255, 255, 0.15)`,j.beginPath(),j.moveTo(275,332),j.lineTo(395,8),j.lineTo(425,8),j.lineTo(305,332),j.closePath(),j.fill(),j.strokeStyle=`rgba(224, 242, 254, 0.88)`,j.lineWidth=4,j.strokeRect(10,10,492,320),j.strokeStyle=`rgba(56, 189, 248, 0.75)`,j.lineWidth=2,j.strokeRect(24,24,464,292),j.beginPath(),j.moveTo(256,48),j.lineTo(376,170),j.lineTo(256,292),j.lineTo(136,170),j.closePath(),j.stroke(),j.beginPath(),j.arc(256,170,48,0,Math.PI*2),j.stroke();function N(e){let t=document.createElement(`canvas`);t.width=512,t.height=512;let n=t.getContext(`2d`),r=n.createLinearGradient(0,0,512,512);e===`orange`?(r.addColorStop(0,`#c2410c`),r.addColorStop(.5,`#ea580c`),r.addColorStop(1,`#9a3412`)):e===`alien`?(r.addColorStop(0,`#581c87`),r.addColorStop(.5,`#6b21a8`),r.addColorStop(1,`#3b0764`)):(r.addColorStop(0,`#b47b46`),r.addColorStop(.5,`#c58b54`),r.addColorStop(1,`#9b6432`)),n.fillStyle=r,n.fillRect(0,0,512,512),n.strokeStyle=e===`orange`?`rgba(154, 52, 18, 0.45)`:e===`alien`?`rgba(59, 7, 100, 0.45)`:`rgba(120, 75, 35, 0.35)`,n.lineWidth=3;for(let e=14;e<512;e+=16)n.beginPath(),n.moveTo(10,e),n.lineTo(502,e),n.stroke();let i=n.createLinearGradient(0,0,512,0);i.addColorStop(0,`rgba(0, 0, 0, 0.42)`),i.addColorStop(.08,`rgba(0, 0, 0, 0)`),i.addColorStop(.92,`rgba(0, 0, 0, 0)`),i.addColorStop(1,`rgba(0, 0, 0, 0.42)`),n.fillStyle=i,n.fillRect(0,0,512,512);let a=n.createLinearGradient(216,0,296,0);if(e===`orange`?(a.addColorStop(0,`rgba(253, 224, 71, 0.6)`),a.addColorStop(.5,`rgba(251, 146, 60, 0.75)`),a.addColorStop(1,`rgba(253, 224, 71, 0.6)`)):e===`alien`?(a.addColorStop(0,`rgba(6, 182, 212, 0.6)`),a.addColorStop(.5,`rgba(168, 85, 247, 0.75)`),a.addColorStop(1,`rgba(6, 182, 212, 0.6)`)):(a.addColorStop(0,`rgba(215, 175, 120, 0.48)`),a.addColorStop(.5,`rgba(240, 205, 150, 0.68)`),a.addColorStop(1,`rgba(215, 175, 120, 0.48)`)),n.fillStyle=a,n.fillRect(216,0,80,512),n.strokeStyle=`rgba(255, 255, 255, 0.35)`,n.lineWidth=2,n.strokeRect(217,0,78,512),n.strokeStyle=`#050508`,n.lineWidth=18,n.strokeRect(9,9,494,494),n.save(),n.fillStyle=`#050508`,n.font=`900 16px sans-serif`,e===`orange`?(n.fillText(`SOLAR CORE · HOT`,28,48),n.fillText(`ACME EXP-77`,340,480)):e===`alien`?(n.fillText(`UFO HAZARD · 42`,28,48),n.fillText(`COSMIC WARP`,340,480)):(n.fillText(`FRAGILE · THIS SIDE UP`,28,48),n.fillText(`BYSANS · ACME`,330,480)),n.restore(),n.save(),n.textAlign=`center`,n.textBaseline=`middle`,n.font=`900 240px sans-serif`,e===`orange`){let e=n.createRadialGradient(256,256,40,256,256,180);e.addColorStop(0,`rgba(253, 224, 71, 0.55)`),e.addColorStop(.6,`rgba(245, 158, 11, 0.25)`),e.addColorStop(1,`rgba(0, 0, 0, 0)`),n.fillStyle=e,n.beginPath(),n.arc(256,256,180,0,Math.PI*2),n.fill()}else if(e===`alien`){let e=n.createRadialGradient(256,256,40,256,256,180);e.addColorStop(0,`rgba(6, 182, 212, 0.55)`),e.addColorStop(.6,`rgba(168, 85, 247, 0.25)`),e.addColorStop(1,`rgba(0, 0, 0, 0)`),n.fillStyle=e,n.beginPath(),n.arc(256,256,180,0,Math.PI*2),n.fill()}if(n.fillStyle=`#050508`,n.fillText(`?`,256,268),n.strokeStyle=`#050508`,n.lineWidth=28,n.lineJoin=`round`,n.strokeText(`?`,256,256),e===`orange`){let e=n.createLinearGradient(256,130,256,380);e.addColorStop(0,`#fef08a`),e.addColorStop(.5,`#f59e0b`),e.addColorStop(1,`#ea580c`),n.fillStyle=e}else if(e===`alien`){let e=n.createLinearGradient(256,130,256,380);e.addColorStop(0,`#67e8f9`),e.addColorStop(.5,`#38bdf8`),e.addColorStop(1,`#c084fc`),n.fillStyle=e}else{let e=n.createLinearGradient(256,130,256,380);e.addColorStop(0,`#ffffff`),e.addColorStop(.7,`#f1f5f9`),e.addColorStop(1,`#cbd5e1`),n.fillStyle=e}return n.fillText(`?`,256,256),n.fillStyle=`#ffffff`,n.beginPath(),n.ellipse(235,175,14,8,-Math.PI/4,0,Math.PI*2),n.fill(),n.restore(),t}function P(){let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`),n=t.createRadialGradient(128,128,12,128,128,120);n.addColorStop(0,`#ffffff`),n.addColorStop(.25,`#fef08a`),n.addColorStop(.55,`#f59e0b`),n.addColorStop(.85,`#ea580c`),n.addColorStop(1,`rgba(194, 65, 12, 0)`),t.fillStyle=n,t.beginPath(),t.arc(128,128,120,0,Math.PI*2),t.fill(),t.fillStyle=`rgba(254, 240, 138, 0.85)`;for(let e=0;e<12;e++){let n=e*Math.PI/6;t.save(),t.translate(128,128),t.rotate(n),t.beginPath(),t.moveTo(-10,80),t.lineTo(0,124),t.lineTo(10,80),t.closePath(),t.fill(),t.restore()}return e}let F=document.createElement(`canvas`);F.width=512,F.height=256;let I=F.getContext(`2d`),L=I.createImageData(512,256),ee=document.createElement(`canvas`);ee.width=512,ee.height=256;let te=ee.getContext(`2d`),ne=te.createImageData(512,256),R=document.createElement(`canvas`);R.width=512,R.height=256;let re=R.getContext(`2d`),z=re.createImageData(512,256),ie=document.createElement(`canvas`);ie.width=512,ie.height=256;let ae=ie.getContext(`2d`),oe=ae.createImageData(512,256),B=document.createElement(`canvas`);B.width=512,B.height=256;let se=B.getContext(`2d`),ce=se.createImageData(512,256);for(let e=0;e<256;e++){let t=e/256,n=Math.abs(t-.5)*2;for(let r=0;r<512;r++){let i=r/512,a=(e*512+r)*4,o=Ug(i*6,t*12,4,2,.5,6,12)*.25,s=Ug(i*8+5.2,t*16+1.3,5,2,.5,8,16)*.085,c=(t+s)*18,l=Math.sin(c*Math.PI)*.5+.5,u=Ug((i+o)*12,(t+s)*24,5,2,.5,12,24),d=(i-.62)*2.2,f=(t-.58)*4.2,p=Math.sqrt(d*d+f*f),m=Math.max(0,1-p),h=J.clamp(l*.65+u*.35,0,1),g=Vg(38,228,h)+m*65,_=Vg(48,192,h)-m*15,v=Vg(72,148,h)-m*45,y=1-n**2.6*.55;L.data[a]=J.clamp(g*y,0,255),L.data[a+1]=J.clamp(_*y,0,255),L.data[a+2]=J.clamp(v*y,0,255),L.data[a+3]=255;let b=Ug(i*5+1.4,t*5+2.1,6,2.05,.52,5,5),x=Wg(i*10,t*10,5,10,10),S=b>.49,C=n+(b-.5)*.32>.78,w=0,T=0,E=0;if(C){let e=.85+.15*x;w=225*e,T=242*e,E=255*e}else if(S){let e=J.clamp((b-.49)/.51,0,1),t=x*e;w=Vg(28,128,e)+t*85,T=Vg(64,118,e)+t*82,E=Vg(42,96,e)+t*90}else{let e=J.clamp(b/.49,0,1)**3.5;w=Vg(4,22,e),T=Vg(16,98,e),E=Vg(44,158,e)}ne.data[a]=J.clamp(w,0,255),ne.data[a+1]=J.clamp(T,0,255),ne.data[a+2]=J.clamp(E,0,255),ne.data[a+3]=255;let D=0;if(S&&!C&&n<.72){let e=1-J.clamp((b-.49)/.16,0,1),n=Ug(i*18+3.7,t*18+6.1,4,2.2,.55,18,18),r=Wg(i*36,t*36,3,36,36),a=(n*.75+e*.35)*r**2.2;a>.36&&(D=J.clamp((a-.36)*2.8,0,1))}oe.data[a]=Math.round(D*255),oe.data[a+1]=Math.round(D*195),oe.data[a+2]=Math.round(D**1.6*115),oe.data[a+3]=255;let O=Ug(i*8,t*8,5,2,.5,8,8),k=Wg(i*7+O*.35,t*7+O*.35,5,7,7),A=J.clamp((k-.62)/.38,0,1)**2.2,j=14+O*32;z.data[a]=J.clamp(j+A*255,0,255),z.data[a+1]=J.clamp(j*.9+A**1.6*185,0,255),z.data[a+2]=J.clamp(j*1.1+A**3*90,0,255),z.data[a+3]=255;let M=Ug(i*4+7.1,t*4,4,2,.5,4,4)*.35,N=Ug(i*4,t*4+9.3,4,2,.5,4,4)*.35,P=Ug((i+M)*8,(t+N)*8,6,2.05,.52,8,8),F=J.clamp((P-.44)*2.4,0,1),I=Math.round(F*255);ce.data[a]=255,ce.data[a+1]=255,ce.data[a+2]=255,ce.data[a+3]=I}}I.putImageData(L,0,0),te.putImageData(ne,0,0),re.putImageData(z,0,0),ae.putImageData(oe,0,0),se.putImageData(ce,0,0);let le=document.createElement(`canvas`);le.width=512,le.height=512;let ue=le.getContext(`2d`),de=ue.createImageData(512,512);for(let e=0;e<512;e++){let t=e-256;for(let n=0;n<512;n++){let r=n-256,i=Math.sqrt(r*r+t*t),a=(e*512+n)*4;if(i<112||i>250){de.data[a+3]=0;continue}let o=(i-112)/138,s=o>.54&&o<.61?.06:o>.86&&o<.885?.08:1,c=.55+.25*Math.sin(o*185)+.15*Math.cos(o*420)+.12*Math.sin(o*890),l=Math.sin(o*Math.PI),u=J.clamp(l*c*s*.92,0,1),d=.5+.5*Math.sin(o*45);de.data[a]=Math.round(Vg(185,245,d)),de.data[a+1]=Math.round(Vg(198,232,d)),de.data[a+2]=Math.round(Vg(215,210,d)),de.data[a+3]=Math.round(u*255)}}ue.putImageData(de,0,0);let fe=(e,t,n,r,i,a,o)=>{let s=document.createElement(`canvas`);s.width=384,s.height=384;let c=s.getContext(`2d`),l=c.createImageData(384,384);for(let s=0;s<384;s++){let c=(s/384-.5)*2;for(let u=0;u<384;u++){let d=(u/384-.5)*2,f=Math.sqrt(d*d+c*c),p=(s*384+u)*4;if(f>=1){l.data[p+3]=0;continue}let m=(1-f*f)**1.85,h=u/384*4.5+e,g=s/384*4.5+e*.7,_=Ug(h,g,4,2,.5,16,16)-.5,v=Ug(h+5.2,g+1.3,4,2,.5,16,16)-.5,y=Wg(h+_*2.2,g+v*2.2,5,16,16),b=Ug(h*.8+_*1.4,g*.8+v*1.4,5,2,.52,16,16),x=Ug(h*1.6-v*1.5,g*1.6+_*1.5,4,2.1,.5,16,16),S=J.clamp((x-.56)*2.6,0,.78),C=J.clamp((b*.55+y**1.6*.65)*(1-S)*m,0,1),w=J.clamp(y**2,0,1),T=Vg(i,t,w)*(.65+.65*y),E=Vg(a,n,w)*(.65+.65*y),D=Vg(o,r,w)*(.65+.65*y);l.data[p]=J.clamp(T,0,255),l.data[p+1]=J.clamp(E,0,255),l.data[p+2]=J.clamp(D,0,255),l.data[p+3]=Math.round(C**1.15*235)}}c.putImageData(l,0,0);let u=new lo(s);return u.colorSpace=qt,u},pe=fe(1.2,85,235,255,139,92,246),me=fe(8.7,254,215,102,14,165,233),he=fe(19.4,244,114,182,56,189,248),ge=document.createElement(`canvas`);ge.width=512,ge.height=256;let V=ge.getContext(`2d`),_e=V.createLinearGradient(0,0,0,256);_e.addColorStop(0,`#0f172a`),_e.addColorStop(.35,`#1e3a8a`),_e.addColorStop(.5,`#38bdf8`),_e.addColorStop(.65,`#311042`),_e.addColorStop(1,`#020617`),V.fillStyle=_e,V.fillRect(0,0,512,256);for(let[e,t,n,r]of[[128,84,56,`rgba(255, 255, 255, 0.9)`],[360,110,72,`rgba(0, 240, 255, 0.85)`],[240,168,64,`rgba(253, 224, 71, 0.75)`],[440,64,48,`rgba(168, 85, 247, 0.7)`]]){let i=V.createRadialGradient(e,t,2,e,t,n);i.addColorStop(0,r),i.addColorStop(1,`rgba(0, 0, 0, 0)`),V.fillStyle=i,V.beginPath(),V.arc(e,t,n,0,Math.PI*2),V.fill()}let ve=document.createElement(`canvas`);ve.width=256,ve.height=256,ve.getContext(`2d`).clearRect(0,0,256,256);let ye=document.createElement(`canvas`);ye.width=512,ye.height=256;let H=ye.getContext(`2d`);H.clearRect(0,0,512,256);let U=H.createRadialGradient(256,128,4,256,128,120);U.addColorStop(0,`rgba(255, 255, 255, 1)`),U.addColorStop(.25,`rgba(254, 240, 138, 0.95)`),U.addColorStop(.55,`rgba(245, 158, 11, 0.45)`),U.addColorStop(1,`rgba(0, 0, 0, 0)`),H.fillStyle=U,H.fillRect(0,0,512,256);let W=document.createElement(`canvas`);W.width=256,W.height=256;let G=W.getContext(`2d`),be=G.createRadialGradient(128,128,6,128,128,118);be.addColorStop(0,`rgba(255, 255, 255, 0.85)`),be.addColorStop(.35,`rgba(56, 189, 248, 0.55)`),be.addColorStop(.7,`rgba(59, 130, 246, 0.22)`),be.addColorStop(1,`rgba(0, 0, 0, 0)`),G.fillStyle=be,G.beginPath(),G.arc(128,128,118,0,Math.PI*2),G.fill();let xe=document.createElement(`canvas`);xe.width=128,xe.height=128;let Se=document.createElement(`canvas`);Se.width=128,Se.height=64;let Ce=document.createElement(`canvas`);Ce.width=128,Ce.height=128;let we=Ce.getContext(`2d`),Ee=we.createRadialGradient(64,64,2,64,64,60);Ee.addColorStop(0,`rgba(255, 255, 255, 1)`),Ee.addColorStop(.32,`rgba(56, 189, 248, 0.85)`),Ee.addColorStop(.72,`rgba(59, 130, 246, 0.3)`),Ee.addColorStop(1,`rgba(0, 0, 0, 0)`),we.fillStyle=Ee,we.beginPath(),we.arc(64,64,60,0,Math.PI*2),we.fill();let De=new ja(new Uint8Array([80,150,215,255]),4,1,Qe);De.minFilter=Oe,De.magFilter=Oe,De.needsUpdate=!0;let ke=new lo(e);ke.colorSpace=qt;let Ae=new lo(r);Ae.colorSpace=qt;let je=new lo(o),Me=new lo(c),Ne=new lo(u);Ne.colorSpace=qt;let Pe=new lo(f),Fe=new lo(g),Ie=new lo(m);Ie.colorSpace=qt;let Le=new lo(v);Le.colorSpace=qt;let Re=new lo(W);Re.colorSpace=qt;let ze=new lo(xe),Be=new lo(A);Be.colorSpace=qt;let Ve=new lo(N(`normal`));Ve.colorSpace=qt;let He=new lo(N(`orange`));He.colorSpace=qt;let Ue=new lo(N(`alien`));Ue.colorSpace=qt;let We=new lo(P());We.colorSpace=qt;let Ge=new lo(Se),Ke=new lo(Ce);Ke.colorSpace=qt;let qe=new lo(b);qe.colorSpace=qt,qe.wrapS=qe.wrapT=Te;let Je=new lo(C);Je.wrapS=Je.wrapT=Te;let Ye=new lo(E);Ye.wrapS=Ye.wrapT=Te;let Xe=new lo(ve),Ze=new lo(ye);Ze.colorSpace=qt;let $e=new lo(F);$e.colorSpace=qt,$e.wrapS=Te;let et=new lo(ee);et.colorSpace=qt,et.wrapS=Te;let tt=new lo(R);tt.colorSpace=qt,tt.wrapS=Te;let nt=new lo(ie);nt.colorSpace=qt,nt.wrapS=Te;let rt=new lo(B);rt.colorSpace=qt,rt.wrapS=Te;let it=new lo(le);it.colorSpace=qt;let at=new lo(ge);return at.mapping=303,at.colorSpace=qt,{hullColor:ke,hullBump:je,hullRoughness:Me,windshieldEyesTex:Ae,platformColor:Ne,platformBump:Pe,archBump:Fe,brickWallColor:Ie,asphaltColor:Le,paintSplatterTex:Re,cartoonCloudTex:pe,nebulaPillarTex:me,nebulaVeilTex:he,chainLinkTex:ze,glassCardTex:Be,cardboardBoxTex:Ve,cardboardOrangeBoxTex:He,cardboardAlienBoxTex:Ue,miniSunTex:We,dollarBillTex:Ge,particleGlow:Ke,asteroidColor:qe,asteroidBump:Je,asteroidRoughness:Ye,hologramGateTex:Xe,supernovaFlareTex:Ze,planetGasGiantTex:$e,planetIceWorldTex:et,planetLavaWorldTex:tt,planetCityLightsTex:nt,planetCloudsTex:rt,planetRingTex:it,hdrEnvEquirectTex:at,toonGradientMap:De}}function Kg(e,t,n,r,i,a){let o=e.getContext(`2d`),s=e.width,c=e.height;o.clearRect(0,0,s,c);let l=s-12,u=c-12;o.fillStyle=`#000000`,o.beginPath(),o.roundRect(9,9,l,u,12),o.fill(),o.fillStyle=a?`#0c223e`:i?`#2d1804`:`#0a0f1d`,o.beginPath(),o.roundRect(6,6,l,u,12),o.fill(),o.strokeStyle=`#000000`,o.lineWidth=5,o.stroke(),o.strokeStyle=a?`#fde047`:r,o.lineWidth=2.2,o.beginPath(),o.roundRect(8,8,l-4,u-4,10),o.stroke(),o.fillStyle=a?`#fde047`:r,o.beginPath(),o.roundRect(10,10,l-8,28,7),o.fill(),o.strokeStyle=`#000000`,o.lineWidth=2.5,o.stroke(),o.textAlign=`center`,o.textBaseline=`middle`,o.font=`900 14px "Plus Jakarta Sans", "Arial Black", sans-serif`,o.fillStyle=`#000000`,o.fillText(`GATE ${t}`,s/2,26,l-20),o.font=`900 ${n.length>10?21:n.length>8?23:26}px "Plus Jakarta Sans", "Arial Black", sans-serif`,o.lineWidth=4,o.strokeStyle=`#000000`,o.strokeText(n,s/2,68,l-20),o.fillStyle=a?`#fde047`:i?`#fef08a`:`#ffffff`,o.fillText(n,s/2,68,l-20)}function qg(e,t){let n=document.createElement(`canvas`);n.width=512,n.height=256;let r=n.getContext(`2d`);r.clearRect(0,0,512,256);let i=r.createRadialGradient(256,128,12,256,128,210);i.addColorStop(0,`rgba(15, 23, 42, 0.9)`),i.addColorStop(.65,`rgba(9, 14, 28, 0.88)`),i.addColorStop(1,`rgba(0, 0, 0, 0)`),r.fillStyle=i,r.beginPath(),r.roundRect(44,48,424,160,24),r.fill(),r.strokeStyle=t,r.lineWidth=4,r.stroke(),r.font=`800 ${e.length>7?56:e.length>5?66:76}px "Plus Jakarta Sans", "JetBrains Mono", sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.shadowColor=t,r.shadowBlur=10,r.fillStyle=`#ffffff`,r.fillText(e,256,129,380),r.shadowBlur=0;let a=new lo(n);return a.colorSpace=qt,a}var Jg=[61695,3718648,16096779,1096065,11032055,16638023],Yg=[`#38bdf8`,`#00f0ff`,`#f59e0b`,`#10b981`,`#a855f7`],Xg=2200,Zg=420,Qg={uniforms:{tDiffuse:{value:null},uResolution:{value:new Y(1920,1080)},uRgbSplit:{value:.0014},uWarpStrength:{value:0},uMotionBlur:{value:0},uHitStopFlash:{value:0},uSupernovaFlash:{value:0},uHeatDistortion:{value:.0022},uLensDistortion:{value:.042},uDofStrength:{value:.24},uAoStrength:{value:.32},uGodRays:{value:0},uTime:{value:0}},vertexShader:`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,fragmentShader:`
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uRgbSplit;
        uniform float uWarpStrength;
        uniform float uMotionBlur;
        uniform float uHitStopFlash;
        uniform float uSupernovaFlash;
        uniform float uHeatDistortion;
        uniform float uLensDistortion;
        uniform float uDofStrength;
        uniform float uAoStrength;
        uniform float uGodRays;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 centeredUv = vUv - center;
            float r2 = dot(centeredUv, centeredUv);
            float dist = sqrt(r2);

            // 1. Subtle Anamorphic Barrel Lens Distortion
            float barrel = 1.0 + r2 * (uLensDistortion + uWarpStrength * 0.28);
            vec2 lensUv = center + centeredUv * barrel;
            vec2 toCenter = center - lensUv;

            // 2. Rear Thruster Heat Distortion Wave (localized to compact rear nozzle wake)
            float thrusterMask = smoothstep(0.16, 0.0, length(lensUv - vec2(0.5, 0.23)));
            vec2 heatWave = vec2(
                sin(lensUv.y * 95.0 - uTime * 30.0),
                cos(lensUv.x * 75.0 - uTime * 25.0)
            ) * uHeatDistortion * thrusterMask;

            // 3. Radial Hyperspace Warp during 300ms Hit-Stop & Speed Bursts
            vec2 uv = clamp(lensUv + heatWave + toCenter * uWarpStrength * dist * 0.55, 0.002, 0.998);

            // 4. Chromatic Aberration Split + Conditional 5-Tap Radial Motion Blur
            float chromaMag = uRgbSplit * (0.25 + dist * 1.55);
            vec2 dir = normalize(toCenter + vec2(0.0001));
            vec2 texel = 1.0 / max(uResolution, vec2(320.0));

            vec3 col;
            if (uMotionBlur > 0.015) {
                float dofMask = smoothstep(0.34, 0.78, dist) * uDofStrength;
                vec3 accumCol = vec3(0.0);
                float totalWeight = 0.0;
                for (int i = 0; i < 5; i++) {
                    float fi = float(i) / 4.0 - 0.5;
                    vec2 blurOffset = toCenter * fi * uMotionBlur * dist * 0.34;
                    vec2 bokehOffset = vec2(cos(float(i) * 1.256), sin(float(i) * 1.256)) * texel * dofMask * 2.8;
                    vec2 sampleUv = clamp(uv + blurOffset + bokehOffset, 0.002, 0.998);

                    float r = texture2D(tDiffuse, clamp(sampleUv + dir * chromaMag, 0.002, 0.998)).r;
                    float g = texture2D(tDiffuse, sampleUv).g;
                    float b = texture2D(tDiffuse, clamp(sampleUv - dir * chromaMag, 0.002, 0.998)).b;

                    float w = 1.0 - abs(fi);
                    accumCol += vec3(r, g, b) * w;
                    totalWeight += w;
                }
                col = accumCol / totalWeight;
            } else {
                float r = texture2D(tDiffuse, clamp(uv + dir * chromaMag, 0.002, 0.998)).r;
                float g = texture2D(tDiffuse, uv).g;
                float b = texture2D(tDiffuse, clamp(uv - dir * chromaMag, 0.002, 0.998)).b;
                col = vec3(r, g, b);
            }

            // 5. Fast Screen-Space Cavity Contrast
            float lumaC = dot(col, vec3(0.299, 0.587, 0.114));
            float lumaH = dot(texture2D(tDiffuse, clamp(uv + vec2(texel.x * 2.0, texel.y * 2.0), 0.002, 0.998)).rgb, vec3(0.299, 0.587, 0.114));
            float cavity = clamp((lumaH - lumaC) * 2.8, 0.0, 1.0);
            col *= (1.0 - cavity * uAoStrength);

            // 6. Volumetric Crepuscular God Rays (Radial Light Shafts on Supernova & Hit-Stop)
            if (uGodRays > 0.01) {
                vec2 rayOrigin = vec2(0.5, 0.54);
                vec2 rayDelta = (uv - rayOrigin) * 0.11;
                vec2 marchUv = uv;
                vec3 godRayAccum = vec3(0.0);
                float decay = 1.0;
                for (int s = 0; s < 6; s++) {
                    marchUv -= rayDelta;
                    vec3 sCol = texture2D(tDiffuse, clamp(marchUv, 0.002, 0.998)).rgb;
                    float bright = smoothstep(0.52, 1.0, dot(sCol, vec3(0.333)));
                    godRayAccum += sCol * bright * decay;
                    decay *= 0.82;
                }
                float angle = atan(centeredUv.y, centeredUv.x);
                float rayBeam = 0.65 + 0.35 * sin(angle * 12.0 + uTime * 3.5);
                col += godRayAccum * uGodRays * rayBeam * 0.26;
            }

            // 7. Clean Cinematic Edge Vignette (preserves center gameplay clarity)
            float vig = smoothstep(0.95, 0.32, dist);
            col *= mix(0.72, 1.02, vig);

            // 8. 300ms Hit-Stop Quantum Capacitor Freeze Edge Pulse
            if (uHitStopFlash > 0.01) {
                float border = smoothstep(0.34, 0.58, dist);
                col += vec3(0.0, 0.85, 1.0) * border * uHitStopFlash * 0.38;
            }

            // 9. Mega Win "SUPERNOVA" Golden Light Flood, God-Ray Starburst & Anamorphic Lens Flare
            if (uSupernovaFlash > 0.01) {
                float radialGlow = exp(-dist * 2.6) * uSupernovaFlash;
                float anamorphicStreak = exp(-abs(vUv.y - 0.52) * 26.0) * exp(-abs(vUv.x - 0.5) * 2.0) * uSupernovaFlash;
                float angle = atan(centeredUv.y, centeredUv.x);
                float crepuscularShafts = pow(0.5 + 0.5 * cos(angle * 16.0 - uTime * 2.5), 3.0) * exp(-dist * 2.2) * uSupernovaFlash;
                vec3 goldLight = vec3(1.0, 0.86, 0.32) * (radialGlow * 0.85 + anamorphicStreak * 1.18 + crepuscularShafts * 0.65);
                col += goldLight;
            }

            gl_FragColor = vec4(col, 1.0);
        }
    `},$g=class{scene;composer;bloomPass;warpPass;glassShardMesh;glassShards=[];glassShardCursor=0;glassDummy=new Ir;glassTempColor=new Z;glassWhiteColor=new Z(16777215);hullShardPool=[];plasmaGlobPool=[];activeDebris=[];activeRings=[];activeMothershipStrikes=[];gpuBurstGeo;gpuBurstPositions;gpuBurstColors;gpuBurstData=[];gpuBurstCursor=0;scorchPool=[];scorchCursor=0;hologramTags=[];hullShardGeo;plasmaGlobGeo;ringGeo;scorchPlaneGeo;shakeIntensity=0;shakeDuration=0;shakeTimer=0;shakeOffset=new X;shakeRoll=0;rgbSplitIntensity=.0014;warpIntensity=0;motionBlurIntensity=0;supernovaFlashIntensity=0;godRaysIntensity=0;elapsed=0;coinFountainActive=!1;confettiInterval=null;beaconLightCyan;beaconLightGold;constructor(e,t,n,r,i,a,o){this.scene=t,this.hullShardGeo=new wo(.42,0),this.plasmaGlobGeo=new bo(.26,1),this.ringGeo=new So(.7,1.2,36),this.ringGeo.rotateX(-Math.PI/2),this.scorchPlaneGeo=new xo(3.6,3.6),this.initPostProcessing(e,t,n,r,i),this.initVolumetricGlassShatterPool(),this.prewarmDebrisPools(75,90),this.initGpuBurstParticleSystem(o||a),a&&this.initPlasmaScorchPool(a,55),this.initOrbitalBeacons()}initPostProcessing(e,t,n,r,i){this.composer=new jg(e);let a=new Mg(t,n);this.composer.addPass(a),this.bloomPass=new Pg(new Y(Math.max(160,Math.floor(r*.5)),Math.max(160,Math.floor(i*.5))),.26,.38,.85),this.composer.addPass(this.bloomPass),this.warpPass=new Og(Qg),this.warpPass.uniforms.uResolution.value.set(r,i),this.composer.addPass(this.warpPass)}setSize(e,t){this.composer.setSize(e,t),this.bloomPass.resolution.set(Math.max(160,Math.floor(e*.5)),Math.max(160,Math.floor(t*.5))),this.warpPass.uniforms.uResolution.value.set(e,t)}initVolumetricGlassShatterPool(){let e=new ho(.03,.35,.06,3);e.rotateX(Math.PI/2),e.computeVertexNormals();let t=new Lo({color:16777215,emissive:3718648,emissiveIntensity:.42,roughness:.04,metalness:.25,ior:1.52,reflectivity:1,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:2.2,flatShading:!0,side:2});this.glassShardMesh=new Ba(e,t,Zg),this.glassShardMesh.instanceMatrix.setUsage($t),this.glassShardMesh.frustumCulled=!1,this.glassDummy.position.set(0,-9999,0),this.glassDummy.scale.set(0,0,0),this.glassDummy.updateMatrix();for(let e=0;e<Zg;e++)this.glassShardMesh.setMatrixAt(e,this.glassDummy.matrix),this.glassShardMesh.setColorAt(e,new Z(14742270)),this.glassShards.push({active:!1,pos:new X(0,-9999,0),vel:new X,rot:new yr,rotVel:new X,scale:new X(1,1,1),baseScale:new X(1,1,1),age:99,maxAge:1,baseColor:new Z(14742270)});this.glassShardMesh.instanceMatrix.needsUpdate=!0,this.glassShardMesh.instanceColor&&(this.glassShardMesh.instanceColor.needsUpdate=!0),this.scene.add(this.glassShardMesh)}spawnVolumetricGlassShatter3D(e,t,n,r=!1){let i=r?[16777215,16707722,16638023,16096779,3718648]:[16777215,14742270,8246268,3718648,61695];for(let r=0;r<240;r++){let a=this.glassShardCursor;this.glassShardCursor=(this.glassShardCursor+1)%Zg;let o=this.glassShards[a];o.active=!0,o.age=0,o.maxAge=.74+Math.random()*.48;let s=(Math.random()-.5)*3.04,c=(Math.random()-.5)*1.95;o.pos.set(e+s,t+1.05+c,n+(Math.random()-.5)*.25);let l=s*(4.5+Math.random()*6.5)+(Math.random()-.5)*7,u=c*(4+Math.random()*5.5)+2.5+Math.random()*5,d=(Math.random()<.65?1:-1)*(8+Math.random()*18);o.vel.set(l,u,d),o.rot.set(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2),o.rotVel.set((Math.random()-.5)*28,(Math.random()-.5)*28,(Math.random()-.5)*28);let f=.55+Math.random()*1.45,p=.65+Math.random()*1.65,m=.8+Math.random()*.9;o.baseScale.set(f,p,m),o.scale.copy(o.baseScale),o.baseColor.setHex(i[r%i.length])}}spawnVolumetricCardboardShatter3D(e,t,n,r=`normal`){let i=r===`orange`?[15357964,16347926,16638023,16707722,12730636,16777215]:r===`alien`?[8266446,11032055,440020,3718648,12616956,16777215]:[11828038,12946260,10183730,13935475,7883555,16777215];for(let r=0;r<200;r++){let a=this.glassShardCursor;this.glassShardCursor=(this.glassShardCursor+1)%Zg;let o=this.glassShards[a];o.active=!0,o.age=0,o.maxAge=.65+Math.random()*.45;let s=(Math.random()-.5)*2.1,c=(Math.random()-.5)*1.9,l=(Math.random()-.5)*1.5;o.pos.set(e+s,t+1+c,n+l);let u=s*(5.5+Math.random()*7)+(Math.random()-.5)*6,d=c*(4.5+Math.random()*6)+3.5+Math.random()*5,f=(Math.random()<.7?1:-.5)*(10+Math.random()*18);o.vel.set(u,d,f),o.rot.set(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2),o.rotVel.set((Math.random()-.5)*32,(Math.random()-.5)*32,(Math.random()-.5)*32);let p=.75+Math.random()*1.5,m=.85+Math.random()*1.6,h=.25+Math.random()*.35;o.baseScale.set(p,m,h),o.scale.copy(o.baseScale),o.baseColor.setHex(i[r%i.length])}this.spawnGpuParticleCloud(e,t+1,n,30,i,5,16,.55)}initGpuBurstParticleSystem(e){this.gpuBurstGeo=new Bi,this.gpuBurstPositions=new Float32Array(Xg*3),this.gpuBurstColors=new Float32Array(Xg*3);for(let e=0;e<Xg;e++){this.gpuBurstPositions[e*3+1]=-9999;let t=new Z(Jg[e%Jg.length]);this.gpuBurstColors[e*3]=t.r,this.gpuBurstColors[e*3+1]=t.g,this.gpuBurstColors[e*3+2]=t.b,this.gpuBurstData.push({vx:0,vy:0,vz:0,age:99,maxAge:1,color:t.clone()})}this.gpuBurstGeo.setAttribute(`position`,new Ti(this.gpuBurstPositions,3)),this.gpuBurstGeo.setAttribute(`color`,new Ti(this.gpuBurstColors,3));let t=new to({size:.78,map:e,vertexColors:!0,transparent:!0,opacity:.82,blending:2,depthWrite:!1}),n=new oo(this.gpuBurstGeo,t);n.frustumCulled=!1,this.scene.add(n)}spawnGpuParticleCloud(e,t,n,r,i,a,o,s=.78){for(let c=0;c<r;c++){let r=this.gpuBurstCursor;this.gpuBurstCursor=(this.gpuBurstCursor+1)%Xg;let l=this.gpuBurstData[r];l.age=0,l.maxAge=s*(.55+Math.random()*.65),l.color.setHex(i[c%i.length]);let u=Math.random()*Math.PI*2,d=Math.acos(2*Math.random()-1),f=a+Math.random()*(o-a);this.gpuBurstPositions[r*3]=e+(Math.random()-.5)*1.4,this.gpuBurstPositions[r*3+1]=t+(Math.random()-.5)*1.2,this.gpuBurstPositions[r*3+2]=n+(Math.random()-.5)*1,l.vx=Math.sin(d)*Math.cos(u)*f,l.vy=Math.cos(d)*f+2.2,l.vz=Math.sin(d)*Math.sin(u)*f}}prewarmDebrisPools(e,t){for(let t=0;t<e;t++){let e=new Io({color:t%2==0?14742270:9741240,emissive:t%2==0?165063:1976635,emissiveIntensity:.55,roughness:.12,metalness:.9,transparent:!0,opacity:1}),n=new Q(this.hullShardGeo,e);n.visible=!1,this.scene.add(n),this.hullShardPool.push({mesh:n,mat:e,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,age:0,maxAge:1})}for(let e=0;e<t;e++){let t=Jg[e%Jg.length],n=new Io({color:t,emissive:t,emissiveIntensity:1.4,roughness:.1,metalness:.25,transparent:!0,opacity:1}),r=new Q(this.plasmaGlobGeo,n);r.visible=!1,this.scene.add(r),this.plasmaGlobPool.push({mesh:r,mat:n,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,age:0,maxAge:1})}}initPlasmaScorchPool(e,t){for(let n=0;n<t;n++){let t=Jg[n%Jg.length],r=new _a({map:e,color:t,transparent:!0,opacity:.45,blending:2,depthWrite:!1,side:2}),i=new Q(this.scorchPlaneGeo,r);i.visible=!1,this.scene.add(i),this.scorchPool.push(i)}}initOrbitalBeacons(){this.beaconLightCyan=new Ss(61695,0,55,1.2),this.beaconLightGold=new Ss(16096779,0,55,1.2),this.scene.add(this.beaconLightCyan,this.beaconLightGold)}stampPermanentPaintSplatter(e,t=!1,n){if(this.scorchPool.length===0)return;let r=this.scorchPool[this.scorchCursor];this.scorchCursor=(this.scorchCursor+1)%this.scorchPool.length;let i=n??Jg[Math.floor(Math.random()*Jg.length)];r.material.color.setHex(i),r.visible=!0;let a=.85+Math.random()*1.1;r.scale.setScalar(a),r.position.set((Math.random()-.5)*16,-.32,e+(Math.random()-.5)*4),r.rotation.set(-Math.PI/2,0,Math.random()*Math.PI*2)}spawnGraffitiMultiplierTag3D(e,t,n,r,i){let a=Yg[i%Yg.length],o=new ua(new Xi({map:qg(`${r.toFixed(2)}×`,a),transparent:!0,opacity:.96,depthTest:!1}));if(o.position.set(e,t+3.4,n),o.scale.set(2.3,1.15,1),o.userData={age:0,maxAge:.62},this.scene.add(o),this.hologramTags.push(o),this.hologramTags.length>6){let e=this.hologramTags.shift();this.scene.remove(e),e.material.map?.dispose(),e.material.dispose()}}clearGraffitiTags(){for(let e of this.hologramTags)this.scene.remove(e),e.material.map?.dispose(),e.material.dispose();this.hologramTags=[]}acquireHullShard(){let e=this.hullShardPool.pop();return e?(e.mesh.visible=!0,this.activeDebris.push(e),e):null}acquirePlasmaGlob(){let e=this.plasmaGlobPool.pop();return e?(e.mesh.visible=!0,this.activeDebris.push(e),e):null}spawnShockwave3D(e,t,n,r,i=6.5,a=.42){let o=new _a({color:r,side:2,transparent:!0,opacity:.85,blending:2,depthWrite:!1}),s=new Q(this.ringGeo,o);s.position.set(e,t+.18,n),this.scene.add(s),this.activeRings.push({mesh:s,mat:o,age:0,maxAge:a,maxScale:i})}spawnSafeBurst3D(e,t,n,r=!1){let i=r?16096779:3718648;this.spawnShockwave3D(e,t,n,i,r?9.5:7,.42),this.triggerScreenShake(r?.4:.25,.24),this.rgbSplitIntensity=Math.max(this.rgbSplitIntensity,r?.012:.0065),this.motionBlurIntensity=Math.max(this.motionBlurIntensity,r?.36:.24),this.warpIntensity=Math.max(this.warpIntensity,.18),this.godRaysIntensity=Math.max(this.godRaysIntensity,r?.55:.28),this.stampPermanentPaintSplatter(n,!1,i),this.spawnVolumetricGlassShatter3D(e,t,n,r),this.spawnGpuParticleCloud(e,t+1,n,r?340:240,r?[16638023,16096779,16777215]:[14742270,3718648,61695],7,22,.68)}spawnCrashExplosion3D(e,t,n){this.spawnShockwave3D(e,t,n,16719426,15,.72),this.spawnShockwave3D(e,t+.4,n,16096779,11,.54),this.triggerScreenShake(2.15,.85),this.rgbSplitIntensity=.044,this.motionBlurIntensity=.65,this.warpIntensity=.32,this.stampPermanentPaintSplatter(n,!1,16719426),this.spawnGpuParticleCloud(e,t+.9,n,780,[16719426,16096779,16638023,16777215],10,32,1);for(let r=0;r<38;r++){let i=this.acquireHullShard();if(!i)break;let a=Math.random()*Math.PI*2,o=Math.random()*Math.PI,s=9+Math.random()*18;i.mat.color.setHex(r%2==0?16719426:16096779),i.mat.emissive.setHex(16719426),i.mat.opacity=1,i.mesh.position.set(e,t+.7,n),i.mesh.scale.setScalar(.9+Math.random()*1.4),i.vx=Math.cos(a)*Math.sin(o)*s,i.vy=Math.cos(o)*s,i.vz=Math.sin(a)*Math.sin(o)*s,i.rx=(Math.random()-.5)*28,i.ry=(Math.random()-.5)*28,i.rz=(Math.random()-.5)*28,i.age=0,i.maxAge=.9+Math.random()*.38}for(let r=0;r<46;r++){let i=this.acquirePlasmaGlob();if(!i)break;let a=Math.random()*Math.PI*2,o=Math.random()*Math.PI*.75,s=10+Math.random()*21,c=r%2==0?16719426:16096779;i.mat.color.setHex(c),i.mat.emissive.setHex(c),i.mat.opacity=1,i.mesh.position.set(e,t+.7,n),i.mesh.scale.setScalar(.95+Math.random()*1.5),i.vx=Math.cos(a)*Math.sin(o)*s,i.vy=Math.cos(o)*s+3.5,i.vz=Math.sin(a)*Math.sin(o)*s,i.rx=18,i.ry=18,i.rz=18,i.age=0,i.maxAge=.82+Math.random()*.38}}triggerSupernovaExplosion3D(e,t,n,r=!0){this.supernovaFlashIntensity=r?.42:.28,this.godRaysIntensity=r?.38:.24,this.rgbSplitIntensity=Math.max(this.rgbSplitIntensity,.008),this.triggerScreenShake(r?.35:.22,.32),this.spawnShockwave3D(e,t+.4,n,58998,12,.55),this.spawnGpuParticleCloud(e,t+1.2,n-1.5,r?150:90,[58998,16638023,61695,16777215],9,24,.75)}spawnShieldDeflect3D(e,t,n){this.spawnShockwave3D(e,t+.6,n,3718648,11,.52),this.triggerScreenShake(.7,.4),this.rgbSplitIntensity=.016,this.motionBlurIntensity=.28,this.spawnVolumetricGlassShatter3D(e,t,n,!1)}triggerAlienMothershipStrike3D(e,t,n){this.triggerScreenShake(.62,.48),this.rgbSplitIntensity=.016,this.motionBlurIntensity=.32,this.godRaysIntensity=Math.max(this.godRaysIntensity,.48);let r=new Lr,i=new Lr,a=n.length>0?n[n.length-1]:t-12.2;i.position.set(e,10.5,a);let o=new Q(new ho(1.4,3.2,.85,16),new Io({color:988970,emissive:3718648,emissiveIntensity:.75,metalness:.88,roughness:.2})),s=new To(2.6,.14,8,24);s.rotateX(Math.PI/2);let c=new Q(s,new _a({color:61695}));i.add(o,c),r.add(i);let l=new _a({color:3718648,transparent:!0,opacity:.72,blending:2,depthWrite:!1,side:2});for(let t of n){let n=new Q(new ho(.6,3.2,11,20,1,!0),l);n.position.set(e,5,t),r.add(n),this.spawnShockwave3D(e,.2,t,3718648,12.5,.65),this.spawnVolumetricGlassShatter3D(e,.4,t,!1)}this.scene.add(r),this.activeMothershipStrikes.push({group:r,mothership:i,coreRing:c,beamMat:l,age:0,maxAge:.95})}triggerScreenShake(e,t){this.shakeIntensity=Math.max(this.shakeIntensity,e),this.shakeDuration=Math.max(this.shakeDuration,t),this.shakeTimer=this.shakeDuration}triggerDesktopConfetti(e=!1){try{Ig(e?{particleCount:115,angle:90,spread:125,origin:{x:.5,y:.82},gravity:.82,scalar:1.3,colors:[`#fde047`,`#f59e0b`,`#00f0ff`,`#10b981`,`#ffffff`]}:{particleCount:55,spread:85,origin:{x:.5,y:.6},colors:[`#00f0ff`,`#fde047`,`#f59e0b`,`#10b981`]})}catch{}}startCoinFountain(){this.coinFountainActive=!0,this.triggerDesktopConfetti(!0),this.confettiInterval!==null&&clearInterval(this.confettiInterval),this.confettiInterval=window.setInterval(()=>{this.coinFountainActive&&this.triggerDesktopConfetti(!0)},1050)}stopCoinFountain(){this.coinFountainActive=!1,this.beaconLightCyan.intensity=0,this.beaconLightGold.intensity=0,this.confettiInterval!==null&&(clearInterval(this.confettiInterval),this.confettiInterval=null)}update(e,t,n,r,i){if(this.elapsed+=e,this.shakeTimer>0){this.shakeTimer-=e;let t=Math.max(0,this.shakeTimer/Math.max(.001,this.shakeDuration)),n=t*t,r=Math.sin(this.elapsed*68)*.65+(Math.random()-.5)*.7,i=Math.cos(this.elapsed*59)*.65+(Math.random()-.5)*.7,a=this.shakeIntensity*n;this.shakeOffset.set(r*a,i*a,(Math.random()-.5)*a*.75),this.shakeRoll=Math.sin(this.elapsed*52)*a*.048}else this.shakeIntensity=0,this.shakeOffset.set(0,0,0),this.shakeRoll=0;let a=.24+Math.min(.28,Math.log10(Math.max(1,t))*.14);if(this.bloomPass.strength=a+(n?.28*r:0)+this.supernovaFlashIntensity*.75,n?(this.warpIntensity=J.lerp(this.warpIntensity,.22*r,e*16),this.rgbSplitIntensity=Math.max(this.rgbSplitIntensity,.0095*r),this.motionBlurIntensity=Math.max(this.motionBlurIntensity,.2*r),this.godRaysIntensity=Math.max(this.godRaysIntensity,.42*r),this.warpPass.uniforms.uHitStopFlash.value=r,this.warpPass.uniforms.uDofStrength.value=.24+.35*r):(this.warpIntensity=Math.max(0,this.warpIntensity-e*.55),this.rgbSplitIntensity=Math.max(.0014,this.rgbSplitIntensity-e*.042),this.motionBlurIntensity=Math.max(0,this.motionBlurIntensity-e*.75),this.godRaysIntensity=Math.max(0,this.godRaysIntensity-e*.85),this.warpPass.uniforms.uHitStopFlash.value=0,this.warpPass.uniforms.uDofStrength.value=.24),this.supernovaFlashIntensity>0&&(this.supernovaFlashIntensity=Math.max(0,this.supernovaFlashIntensity-e*.85)),this.warpPass.uniforms.uWarpStrength.value=this.warpIntensity,this.warpPass.uniforms.uRgbSplit.value=this.rgbSplitIntensity,this.warpPass.uniforms.uMotionBlur.value=this.motionBlurIntensity,this.warpPass.uniforms.uSupernovaFlash.value=this.supernovaFlashIntensity,this.warpPass.uniforms.uGodRays.value=Math.max(this.godRaysIntensity,this.supernovaFlashIntensity),this.warpPass.uniforms.uHeatDistortion.value=n?.0055:.0022,this.warpPass.uniforms.uTime.value=this.elapsed,this.coinFountainActive){let e=Math.sin(this.elapsed*18)>0;this.beaconLightCyan.position.set(i.x-7,i.y+8,i.z-6),this.beaconLightGold.position.set(i.x+7,i.y+8,i.z-6),this.beaconLightCyan.intensity=e?32:4,this.beaconLightGold.intensity=e?4:32}let o=!1;for(let t=0;t<Zg;t++){let n=this.glassShards[t];if(!n.active)continue;if(o=!0,n.age+=e,n.age>=n.maxAge){n.active=!1,this.glassDummy.position.set(0,-9999,0),this.glassDummy.scale.set(0,0,0),this.glassDummy.updateMatrix(),this.glassShardMesh.setMatrixAt(t,this.glassDummy.matrix);continue}n.vel.y-=6.5*e,n.pos.addScaledVector(n.vel,e),n.rot.x+=n.rotVel.x*e,n.rot.y+=n.rotVel.y*e,n.rot.z+=n.rotVel.z*e;let r=1-n.age/n.maxAge,i=r<.25?r/.25:1;this.glassDummy.position.copy(n.pos),this.glassDummy.rotation.copy(n.rot),this.glassDummy.scale.copy(n.baseScale).multiplyScalar(i),this.glassDummy.updateMatrix(),this.glassShardMesh.setMatrixAt(t,this.glassDummy.matrix);let a=Math.max(0,Math.sin(n.rot.x*2+n.rot.y*2))**6;this.glassTempColor.copy(n.baseColor).lerp(this.glassWhiteColor,a*.88),this.glassShardMesh.setColorAt(t,this.glassTempColor)}o&&(this.glassShardMesh.instanceMatrix.needsUpdate=!0,this.glassShardMesh.instanceColor&&(this.glassShardMesh.instanceColor.needsUpdate=!0));let s=!1;for(let t=0;t<Xg;t++){let n=this.gpuBurstData[t];if(n.age>=n.maxAge)continue;if(s=!0,n.age+=e,n.age>=n.maxAge){this.gpuBurstPositions[t*3+1]=-9999;continue}n.vx*=1-e*1.4,n.vy*=1-e*1.4,n.vz*=1-e*1.4,this.gpuBurstPositions[t*3]+=n.vx*e,this.gpuBurstPositions[t*3+1]+=n.vy*e,this.gpuBurstPositions[t*3+2]+=n.vz*e;let r=Math.max(0,1-n.age/n.maxAge);this.gpuBurstColors[t*3]=n.color.r*r,this.gpuBurstColors[t*3+1]=n.color.g*r,this.gpuBurstColors[t*3+2]=n.color.b*r}s&&(this.gpuBurstGeo.attributes.position.needsUpdate=!0,this.gpuBurstGeo.attributes.color.needsUpdate=!0);for(let t=this.activeDebris.length-1;t>=0;t--){let n=this.activeDebris[t];if(n.age+=e,n.age>=n.maxAge){n.mesh.visible=!1,this.activeDebris.splice(t,1),n.mesh.geometry===this.hullShardGeo?this.hullShardPool.push(n):this.plasmaGlobPool.push(n);continue}n.mesh.position.x+=n.vx*e,n.mesh.position.y+=n.vy*e,n.mesh.position.z+=n.vz*e,n.mesh.rotation.x+=n.rx*e,n.mesh.rotation.y+=n.ry*e,n.mesh.rotation.z+=n.rz*e;let r=1-n.age/n.maxAge;n.mat.opacity=r}for(let t=this.activeRings.length-1;t>=0;t--){let n=this.activeRings[t];if(n.age+=e,n.age>=n.maxAge){this.scene.remove(n.mesh),n.mat.dispose(),this.activeRings.splice(t,1);continue}let r=n.age/n.maxAge,i=.5+(1-(1-r)**3)*n.maxScale;n.mesh.scale.setScalar(i),n.mat.opacity=(1-r)*.85}for(let t=this.activeMothershipStrikes.length-1;t>=0;t--){let n=this.activeMothershipStrikes[t];if(n.age+=e,n.age>=n.maxAge){this.scene.remove(n.group),n.group.traverse(e=>{e instanceof Q&&(e.geometry?.dispose(),Array.isArray(e.material)?e.material.forEach(e=>e.dispose()):e.material?.dispose())}),this.activeMothershipStrikes.splice(t,1);continue}n.coreRing.rotation.z+=e*18;let r=Math.sin(n.age/n.maxAge*Math.PI);n.beamMat.opacity=r*.82}for(let t=this.hologramTags.length-1;t>=0;t--){let n=this.hologramTags[t],r=(n.userData.age||0)+e,i=n.userData.maxAge||.72;if(n.userData.age=r,r>=i){this.scene.remove(n),n.material.map?.dispose(),n.material.dispose(),this.hologramTags.splice(t,1);continue}n.position.y+=e*1.95;let a=r/i;n.material.opacity=a<.2?a/.2*.96:(1-(a-.2)/.8)*.96}}},e_=48,t_=820,n_=[61695,3718648,16638023,16096779,9133302,1096065];function r_(e=1){let t=e,n=[],r=[];function i(e,i,a,o,s,c){n.push(e[0]*t,e[1]*t,e[2]*t),n.push(i[0]*t,i[1]*t,i[2]*t),n.push(a[0]*t,a[1]*t,a[2]*t),r.push(...o,...s,...c)}let a=[0,.08,-1.25],o=[0,.62,-.2],s=[0,.42,.75],c=[-.58,.38,-.2],l=[.58,.38,-.2],u=[-.28,.02,-.92],d=[.28,.02,-.92],f=[-.62,.02,-.18],p=[.62,.02,-.18],m=[-.44,.02,.75],h=[.44,.02,.75];i(a,u,o,[.5,0],[.2,.3],[.5,.6]),i(a,o,d,[.5,0],[.5,.6],[.8,.3]),i(o,u,c,[.5,.6],[.2,.3],[.1,.6]),i(o,l,d,[.5,.6],[.9,.6],[.8,.3]),i(c,u,f,[.1,.6],[.2,.3],[.05,.5]),i(l,p,d,[.9,.6],[.95,.5],[.8,.3]),i(o,c,s,[.5,.6],[.1,.6],[.5,1]),i(o,s,l,[.5,.6],[.5,1],[.9,.6]),i(s,c,m,[.5,1],[.1,.6],[.25,.95]),i(s,h,l,[.5,1],[.75,.95],[.9,.6]),i(c,f,m,[.1,.6],[.05,.5],[.25,.95]),i(l,h,p,[.9,.6],[.75,.95],[.95,.5]),i(s,m,h,[.5,1],[.25,.95],[.75,.95]);let g=new Bi;return g.setAttribute(`position`,new Oi(n,3)),g.setAttribute(`uv`,new Oi(r,2)),g.computeVertexNormals(),g}function i_(e){let t=new Bi,n=e?-1:1,r=.05,i=-.05,a=[n*.72,r,-.15],o=[n*.72,r,1.15],s=[n*1.95,r,.42],c=[n*1.95,r,.9],l=[n*.72,i,-.15],u=[n*.72,i,1.15],d=[n*1.95,i,.42],f=[n*1.95,i,.9],p=[];function m(e,t,n,r){p.push(...e,...t,...n),p.push(...e,...n,...r),p.push(...e,...n,...t),p.push(...e,...r,...n)}return m(a,s,c,o),m(u,f,d,l),m(a,l,d,s),m(c,f,u,o),m(s,d,f,c),m(o,u,l,a),t.setAttribute(`position`,new Oi(p,3)),t.computeVertexNormals(),t}function a_(e){let t=new Bi,n=e?-1:1,r=.054,i=-.054,a=[n*.72,r,-.15],o=[n*.72,r,.010000000000000009],s=[n*1.95,r,.42],c=[n*1.95,r,.524],l=[n*.72,i,-.15],u=[n*.72,i,.010000000000000009],d=[n*1.95,i,.42],f=[n*1.95,i,.524],p=[];function m(e,t,n,r){p.push(...e,...t,...n),p.push(...e,...n,...r),p.push(...e,...n,...t),p.push(...e,...r,...n)}return m(a,s,c,o),m(u,f,d,l),m(a,l,d,s),m(s,d,f,c),t.setAttribute(`position`,new Oi(p,3)),t.computeVertexNormals(),t}function o_(){let e=new Bi,t=.038,n=.46,r=[0,0,.55],i=[0,0,1.35],a=[0,n,.9],o=[0,n,1.25],s=[];function c(e,t,n,r){s.push(...e,...t,...n),s.push(...e,...n,...r),s.push(...e,...n,...t),s.push(...e,...r,...n)}let l=[-.038,r[1],r[2]],u=[-.038,i[1],i[2]],d=[-.038,a[1],a[2]],f=[-.038,o[1],o[2]],p=[t,r[1],r[2]],m=[t,i[1],i[2]],h=[t,a[1],a[2]],g=[t,o[1],o[2]];return c(l,d,f,u),c(p,m,g,h),c(l,p,h,d),c(u,f,g,m),c(d,h,g,f),c(l,u,m,p),e.setAttribute(`position`,new Oi(s,3)),e.computeVertexNormals(),e}function s_(){let e=new Bi,t=.042,n=.47,r=[0,0,.54],i=[0,0,.66],a=[0,n,.89],o=[0,n,.974],s=[];function c(e,t,n,r){s.push(...e,...t,...n),s.push(...e,...n,...r),s.push(...e,...n,...t),s.push(...e,...r,...n)}let l=[-.042,r[1],r[2]],u=[-.042,i[1],i[2]],d=[-.042,a[1],a[2]],f=[-.042,o[1],o[2]],p=[t,r[1],r[2]],m=[t,i[1],i[2]],h=[t,a[1],a[2]],g=[t,o[1],o[2]];return c(l,d,f,u),c(p,m,g,h),c(l,p,h,d),c(d,h,g,f),e.setAttribute(`position`,new Oi(s,3)),e.computeVertexNormals(),e}var c_=class{root;chassis;leftWingFlap;rightWingFlap;leftCanard;rightCanard;exhaustVents=[];leftNozzle;rightNozzle;centerNozzle;leftPlasmaJet;rightPlasmaJet;centerPlasmaJet;impactWobbleTimer=0;anticipationSquashTimer=0;wingtipL;wingtipR;nozzleTipL;nozzleTipR;nozzleTipCenter;noseSpotLight;noseLightTarget;enginePointLight;accentMat;thrusterCoreMat;plasmaJetMatL;plasmaJetMatR;plasmaJetMatCenter;pos=new X(0,1.85,0);vel=new X(0,0,0);targetPos=new X(0,1.85,0);cursorAim=new Y(0,0);smoothedCursorAim=new Y(0,0);roll=0;rollVel=0;pitch=0;pitchVel=0;yaw=0;yawVel=0;jumpArcTimer=0;jumpArcDuration=.24;jumpPeakHeight=1.9;lastTargetZ=0;hydraulicPartyTimer=0;postHitStopBurstTimer=0;crashExplosionTimer=0;scratchThrusterColor=new Z;scratchWingtipL=new X;scratchWingtipR=new X;scratchNozzleTipL=new X;scratchNozzleTipR=new X;scratchNozzleTipC=new X;scratchExhaustDir=new X;leftRibbonPos;rightRibbonPos;leftRibbonGeo;rightRibbonGeo;leftRibbonMat;rightRibbonMat;ribbonHistoryL=[];ribbonHistoryR=[];plasmaGeo;plasmaPositions;plasmaColors;plasmaParticles=[];plasmaSpawnCursor=0;elapsed=0;constructor(e,t){this.root=new Lr,this.chassis=new Lr,this.root.add(this.chassis),e.add(this.root),this.buildOverdriveSpacecraft(t),this.buildLights(e),this.buildWingtipIonRibbons(e),this.buildPlasmaThrusterParticles(e,t.particleGlow)}setCursorAim(e,t){this.cursorAim.set(J.clamp(e,-1,1),J.clamp(t,-1,1))}buildOverdriveSpacecraft(e){let t=new Io({map:e.hullColor,bumpMap:e.hullBump,bumpScale:.02,roughnessMap:e.hullRoughness,roughness:.58,metalness:.1}),n=new Io({color:1317412,roughness:.65,metalness:.38}),r=new Io({color:3359061,roughness:.42,metalness:.72}),i=new Io({map:e.windshieldEyesTex,color:403517,emissive:54015,emissiveIntensity:.65,roughness:.22,metalness:.25,transparent:!0,opacity:.94,side:2}),a=new _a({color:3718648,transparent:!0,opacity:.45,blending:2,side:2}),o=new Io({color:16317180,roughness:.55,metalness:.1,side:2});this.accentMat=new Io({color:55536,emissive:55536,emissiveIntensity:.6,roughness:.25,metalness:.5});let s=new Io({color:16752640,emissive:16747520,emissiveIntensity:1.4,roughness:.2,metalness:.3});this.thrusterCoreMat=new Io({color:61695,emissive:61695,emissiveIntensity:1.4,roughness:.2,metalness:.5});let c=new Q(new mo(1.85,.28,2.6),t);c.position.set(0,.08,.3),c.castShadow=!0,c.receiveShadow=!0,this.chassis.add(c);let l=new Q(new mo(1.25,.24,1.85),t);l.position.set(0,.06,-1.65),l.castShadow=!0,this.chassis.add(l);let u=new ho(.24,.58,.85,24);u.rotateX(-Math.PI/2),u.scale(1.15,.48,1);let d=new Q(u,t);d.position.set(0,.08,-2.45),this.chassis.add(d);let f=new ho(.22,.26,.42,24);f.rotateX(-Math.PI/2);let p=new Q(f,n);p.position.set(0,.08,-2.85),this.chassis.add(p);let m=new Q(new To(.2,.025,16,28),this.accentMat);m.position.set(0,.08,-2.95),this.chassis.add(m);let h=new Q(new mo(.88,.08,1.25),n);h.position.set(0,-.06,-2.1),this.chassis.add(h);let g=new mo(.06,.06,.12),_=new Q(g,s);_.position.set(-.26,-.04,-2.68);let v=new Q(g,s);v.position.set(.26,-.04,-2.68),this.chassis.add(_,v);let y=new ho(.2,.38,2,24);y.rotateX(-Math.PI/2),y.scale(.85,.48,1);let b=new Q(y,t);b.position.set(-.76,.08,-1.55);let x=new Q(y,t);x.position.set(.76,.08,-1.55),this.chassis.add(b,x);let S=new mo(.22,.16,2.4),C=new Q(S,t);C.position.set(-.95,-.02,.3);let w=new Q(S,t);w.position.set(.95,-.02,.3),this.chassis.add(C,w);let T=new Q(new mo(.88,.08,3.4),n);T.position.set(0,.24,-.3),T.castShadow=!0,this.chassis.add(T);let E=new Q(new mo(.55,.06,1.35),n);E.position.set(0,.2,-1.85),E.rotation.x=-.12,this.chassis.add(E);let D=new mo(.04,.035,2.8),O=new Q(D,this.accentMat);O.position.set(-.46,.28,-.25);let k=new Q(D,this.accentMat);k.position.set(.46,.28,-.25),this.chassis.add(O,k);let A=new mo(.04,.035,.45),j=new Q(A,this.accentMat);j.position.set(-.58,.28,.75),j.rotation.y=.78;let M=new Q(A,this.accentMat);M.position.set(.58,.28,.75),M.rotation.y=-.78,this.chassis.add(j,M),this.leftCanard=new Q(new Bi),this.rightCanard=new Q(new Bi),this.chassis.add(this.leftCanard,this.rightCanard),this.exhaustVents=[];let N=new Lr;N.position.set(0,.26,-.55);let P=new Q(r_(1),i);P.castShadow=!0,N.add(P);let F=new Q(r_(.85),a);F.position.y=.03,N.add(F),this.chassis.add(N);let I=o_(),L=s_(),ee=new Q(I,o);ee.position.set(-.64,.28,0),ee.rotation.z=.35,ee.castShadow=!0;let te=new Q(L,n);te.position.set(-.64,.28,0),te.rotation.z=.35;let ne=new Q(I,o);ne.position.set(.64,.28,0),ne.rotation.z=-.35,ne.castShadow=!0;let R=new Q(L,n);R.position.set(.64,.28,0),R.rotation.z=-.35,this.chassis.add(ee,te,ne,R);let re=new Q(i_(!0),o);re.position.set(0,.14,0),re.castShadow=!0;let z=new Q(i_(!1),o);z.position.set(0,.14,0),z.castShadow=!0,this.chassis.add(re,z);let ie=new Q(a_(!0),n);ie.position.set(0,.14,0);let ae=new Q(a_(!1),n);ae.position.set(0,.14,0),this.chassis.add(ie,ae);let oe=new mo(.12,.08,.26),B=new mo(.15,.09,.3),se=new Q(B,n);se.position.set(-1.94,.14,.5),se.rotation.y=.24;let ce=new Q(oe,s);ce.position.set(-1.96,.14,.5),ce.rotation.y=.24;let le=new Q(B,n);le.position.set(1.94,.14,.5),le.rotation.y=-.24;let ue=new Q(oe,s);ue.position.set(1.96,.14,.5),ue.rotation.y=-.24,this.chassis.add(se,ce,le,ue),this.leftWingFlap=new Lr,this.rightWingFlap=new Lr,this.chassis.add(this.leftWingFlap,this.rightWingFlap),this.wingtipL=new Ir,this.wingtipL.position.set(-1.95,.14,.9),this.chassis.add(this.wingtipL),this.wingtipR=new Ir,this.wingtipR.position.set(1.95,.14,.9),this.chassis.add(this.wingtipR),this.leftNozzle=new Lr,this.leftNozzle.position.set(-.64,.1,1.48),this.chassis.add(this.leftNozzle),this.rightNozzle=new Lr,this.rightNozzle.position.set(.64,.1,1.48),this.chassis.add(this.rightNozzle),this.centerNozzle=new Lr,this.centerNozzle.position.set(0,.14,1.48),this.chassis.add(this.centerNozzle);let de=new Q(new mo(.32,.28,1.15),n);this.centerNozzle.add(de);let fe=new ho(.24,.28,1.15,24);fe.rotateX(Math.PI/2);let pe=new Q(fe,n),me=new Q(fe,n);this.leftNozzle.add(pe),this.rightNozzle.add(me);let he=new To(.26,.035,12,24),ge=new Q(he,r);ge.position.z=.55;let V=new Q(he,r);V.position.z=.55,this.leftNozzle.add(ge),this.rightNozzle.add(V);let _e=new ho(.21,.21,.06,20);_e.rotateX(Math.PI/2);let ve=new Q(_e,this.thrusterCoreMat);ve.position.z=.46;let ye=new Q(_e,this.thrusterCoreMat);ye.position.z=.46,this.leftNozzle.add(ve),this.rightNozzle.add(ye),this.plasmaJetMatL=new _a({color:61695,transparent:!0,opacity:.85,blending:2,depthWrite:!1}),this.plasmaJetMatR=new _a({color:61695,transparent:!0,opacity:.85,blending:2,depthWrite:!1}),this.plasmaJetMatCenter=new _a({color:3718648,transparent:!0,opacity:0,blending:2,depthWrite:!1});let H=new go(.2,2.4,20);H.rotateX(Math.PI/2),H.translate(0,0,1.35);let U=new go(.05,.05,4);U.rotateX(Math.PI/2),this.leftPlasmaJet=new Q(H,this.plasmaJetMatL),this.rightPlasmaJet=new Q(H,this.plasmaJetMatR),this.centerPlasmaJet=new Q(U,this.plasmaJetMatCenter),this.leftNozzle.add(this.leftPlasmaJet),this.rightNozzle.add(this.rightPlasmaJet),this.centerNozzle.add(this.centerPlasmaJet),this.nozzleTipL=new Ir,this.nozzleTipL.position.set(0,0,.58),this.leftNozzle.add(this.nozzleTipL),this.nozzleTipR=new Ir,this.nozzleTipR.position.set(0,0,.58),this.rightNozzle.add(this.nozzleTipR),this.nozzleTipCenter=new Ir,this.nozzleTipCenter.position.set(0,0,.5),this.centerNozzle.add(this.nozzleTipCenter)}drawCartoonEyes(e,t,n,r,i){}buildLights(e){this.noseSpotLight=new bs(14742270,28,52,Math.PI/3.6,.5,1.2),this.noseSpotLight.position.set(0,.5,-2.95),this.noseSpotLight.castShadow=!0,this.noseSpotLight.shadow.mapSize.width=1024,this.noseSpotLight.shadow.mapSize.height=1024,this.noseSpotLight.shadow.camera.near=1.5,this.noseSpotLight.shadow.camera.far=48,this.chassis.add(this.noseSpotLight),this.noseLightTarget=new Ir,this.noseLightTarget.position.set(0,-1,-16),this.chassis.add(this.noseLightTarget),this.noseSpotLight.target=this.noseLightTarget,e.add(this.noseSpotLight.target),this.enginePointLight=new Ss(61695,11,8.5,1.8),this.enginePointLight.position.set(0,.3,2.95),this.chassis.add(this.enginePointLight)}buildWingtipIonRibbons(e){for(let e=0;e<e_;e++)this.ribbonHistoryL.push(new X(-2.68,.18,1.28)),this.ribbonHistoryR.push(new X(2.68,.18,1.28));let t=(t,n,r)=>{let i=[];for(let e=0;e<47;e++){let t=e*2,n=e*2+1,r=(e+1)*2,a=(e+1)*2+1;i.push(t,n,r,n,a,r)}n.setAttribute(`position`,new Ti(t,3)),n.setIndex(i);let a=new Q(n,r);a.frustumCulled=!1,e.add(a)};this.leftRibbonPos=new Float32Array(288),this.rightRibbonPos=new Float32Array(288),this.leftRibbonGeo=new Bi,this.rightRibbonGeo=new Bi,this.leftRibbonMat=new _a({color:3718648,transparent:!0,opacity:.52,blending:2,side:2,depthWrite:!1}),this.rightRibbonMat=new _a({color:3718648,transparent:!0,opacity:.52,blending:2,side:2,depthWrite:!1}),t(this.leftRibbonPos,this.leftRibbonGeo,this.leftRibbonMat),t(this.rightRibbonPos,this.rightRibbonGeo,this.rightRibbonMat)}buildPlasmaThrusterParticles(e,t){this.plasmaGeo=new Bi,this.plasmaPositions=new Float32Array(t_*3),this.plasmaColors=new Float32Array(t_*3);for(let e=0;e<t_;e++){this.plasmaPositions[e*3+1]=-999;let t=new Z(n_[e%n_.length]);this.plasmaColors[e*3]=t.r,this.plasmaColors[e*3+1]=t.g,this.plasmaColors[e*3+2]=t.b,this.plasmaParticles.push({vx:0,vy:0,vz:0,age:99,maxAge:1,color:t.clone(),isEmber:e%3==0})}this.plasmaGeo.setAttribute(`position`,new Ti(this.plasmaPositions,3)),this.plasmaGeo.setAttribute(`color`,new Ti(this.plasmaColors,3));let n=new to({size:.78,map:t,vertexColors:!0,transparent:!0,opacity:.85,blending:2,depthWrite:!1}),r=new oo(this.plasmaGeo,n);r.frustumCulled=!1,e.add(r)}triggerSpeedBurst(e=.42){this.postHitStopBurstTimer=e,this.pitchVel-=3.6}triggerHydraulicBlockParty(e=4){this.hydraulicPartyTimer=e,this.rollVel+=9.5}snapTo(e,t,n){this.pos.set(e,t,n),this.targetPos.set(e,t,n),this.vel.set(0,0,0),this.lastTargetZ=n,this.jumpArcTimer=0,this.postHitStopBurstTimer=0,this.impactWobbleTimer=0,this.anticipationSquashTimer=0,this.chassis.position.set(0,0,0),this.chassis.scale.setScalar(1),this.roll=0,this.rollVel=0,this.pitch=0,this.pitchVel=0,this.yaw=0,this.yawVel=0,this.crashExplosionTimer=0,this.chassis.visible=!0,this.chassis.scale.set(1,1,1),this.root.position.copy(this.pos),this.chassis.rotation.set(0,0,0),this.root.updateMatrixWorld(!0);let r=new X,i=new X;this.wingtipL.getWorldPosition(r),this.wingtipR.getWorldPosition(i);for(let e=0;e<e_;e++)this.ribbonHistoryL[e].copy(r),this.ribbonHistoryR[e].copy(i)}setTargetPosition(e,t,n){Math.abs(n-this.lastTargetZ)>1&&(this.lastTargetZ=n,this.jumpArcTimer=this.jumpArcDuration,this.pitchVel+=3,this.anticipationSquashTimer=.12),this.targetPos.set(e,t,n)}update(e,t,n,r,i,a,o,s=1,c=!1){this.elapsed+=e,this.hydraulicPartyTimer>0&&(this.hydraulicPartyTimer=Math.max(0,this.hydraulicPartyTimer-e)),this.postHitStopBurstTimer>0&&(this.postHitStopBurstTimer=Math.max(0,this.postHitStopBurstTimer-e)),this.impactWobbleTimer>0&&(this.impactWobbleTimer=Math.max(0,this.impactWobbleTimer-e)),this.anticipationSquashTimer>0&&(this.anticipationSquashTimer=Math.max(0,this.anticipationSquashTimer-e)),this.smoothedCursorAim.lerp(this.cursorAim,Math.min(1,e*14));let l=this.postHitStopBurstTimer>0,u=this.scratchThrusterColor.setHex(o?16719426:l?16638023:t);this.thrusterCoreMat.color.lerp(u,e*10),this.thrusterCoreMat.emissive.lerp(u,e*10),this.enginePointLight.color.lerp(u,e*10),this.enginePointLight.intensity=l?22:n?18:11,this.plasmaJetMatL.color.lerp(u,e*10);let d=0;if(this.jumpArcTimer>0){this.jumpArcTimer=Math.max(0,this.jumpArcTimer-e);let t=1-this.jumpArcTimer/this.jumpArcDuration;d=Math.sin(t*Math.PI)*this.jumpPeakHeight}let f=Math.sin(this.elapsed*3.6)*.08+Math.sin(this.elapsed*1.5+1.2)*.04-this.smoothedCursorAim.y*.18,p=Math.sin(this.elapsed*2.4)*.035,m=Math.cos(this.elapsed*2.8)*.025,h=l?270:250,g=1.68*Math.sqrt(h),_=n&&r!==null?r:this.targetPos.x,v=this.targetPos.y+d+f,y=this.targetPos.z,b=(_-this.pos.x)*h-this.vel.x*g,x=(v-this.pos.y)*h-this.vel.y*g,S=(y-this.pos.z)*h-this.vel.z*g;this.vel.x+=b*e,this.vel.y+=x*e,this.vel.z+=S*e,this.pos.x+=this.vel.x*e,this.pos.y+=this.vel.y*e,this.pos.z+=this.vel.z*e,Math.abs(_-this.pos.x)<.04&&Math.abs(this.vel.x)<.65&&(Math.abs(this.vel.x)>.08&&(this.impactWobbleTimer=.38),this.pos.x=_,this.vel.x=0),Math.abs(y-this.pos.z)<.04&&Math.abs(this.vel.z)<.65&&(Math.abs(this.vel.z)>.08&&(this.impactWobbleTimer=.38),this.pos.z=y,this.vel.z=0),this.root.position.copy(this.pos);let C=Math.abs(this.vel.z),w=Math.abs(this.vel.x),T=1+Math.min(.4,C*.015+(l?.24:0)),E=1+Math.min(.25,w*.018);if(this.anticipationSquashTimer>0){let e=this.anticipationSquashTimer/.12;T*=1-e*.22,E*=1+e*.18}let D=0,O=0;if(this.impactWobbleTimer>0){let e=.38-this.impactWobbleTimer,t=Math.exp(-this.impactWobbleTimer*9.2),n=Math.sin(e*32)*t;D=-n*.28,O=n*.2}let k=Math.sin(this.elapsed*3.6)*.038,A=1/Math.sqrt(T)*E*(1+O)*(1-k*.8),j=1/Math.sqrt(T*E)*(1+D)*(1+k*1.4),M=T*(1+O)*(1-k*.8);if(o){this.crashExplosionTimer+=e,this.rollVel+=18*e,this.pitchVel+=10*e,this.yawVel+=24*e;let t=Math.max(0,1-this.crashExplosionTimer*3.8);this.chassis.scale.setScalar(t),t<=.02&&(this.chassis.visible=!1)}else this.crashExplosionTimer=0,this.chassis.visible||(this.chassis.visible=!0),this.chassis.scale.set(A,j,M);let N=_-this.pos.x,P=-this.smoothedCursorAim.x*.3,F=-this.smoothedCursorAim.y*.28,I=-this.smoothedCursorAim.x*.36,L=((o?this.roll+this.rollVel*e:J.clamp(-this.vel.x*.085-N*.22+P+p,-.65,.65))-this.roll)*125-this.rollVel*13;this.rollVel+=L*e,this.roll+=this.rollVel*e;let ee=((o?this.pitch+this.pitchVel*e:J.clamp(-.18+this.vel.y*.045+(n?.24:0)-this.vel.z*.009+F+m,-.45,.48))-this.pitch)*110-this.pitchVel*11;this.pitchVel+=ee*e,this.pitch+=this.pitchVel*e;let te=((o?this.yaw+this.yawVel*e:J.clamp(-this.vel.x*.032-N*.085+I,-.52,.52))-this.yaw)*110-this.yawVel*12;this.yawVel+=te*e,this.yaw+=this.yawVel*e,this.chassis.rotation.order=`YXZ`,this.chassis.rotation.y=this.yaw,this.chassis.rotation.x=this.pitch,this.chassis.rotation.z=this.roll,this.leftWingFlap.rotation.z=J.clamp(-this.roll*.82,-.58,.58),this.rightWingFlap.rotation.z=J.clamp(-this.roll*.82,-.58,.58),this.leftCanard.rotation.x=this.pitch*.95+m,this.rightCanard.rotation.x=this.pitch*.95+m;let ne=-this.smoothedCursorAim.x*.22,R=this.smoothedCursorAim.y*.18;this.leftNozzle.rotation.set(R,ne,0),this.rightNozzle.rotation.set(R,ne,0),this.centerNozzle.rotation.set(R,ne,0);let re=n||l?.5:.18+Math.sin(this.elapsed*8)*.08;for(let e=0;e<this.exhaustVents.length;e++)this.exhaustVents[e].rotation.x=re;let z=Math.min(3.2,Math.hypot(this.vel.x,this.vel.z)/12),ie=(n?3.2:l?3.8:1.25+z*1.15)+Math.sin(this.elapsed*48)*.25;this.leftPlasmaJet.scale.set(1+z*.26,1+z*.26,ie),this.rightPlasmaJet.scale.set(1+z*.26,1+z*.26,ie),this.centerPlasmaJet.scale.set(1+z*.32,1+z*.32,ie*1.18);let ae=i===null?this.pos.x+this.smoothedCursorAim.x*7.5:i,oe=-.4-this.smoothedCursorAim.y*3.2;this.noseLightTarget.position.set(ae,oe,this.pos.z-16),this.root.updateMatrixWorld(!0),this.updateWingtipIonRibbons(),this.updatePlasmaParticles(e,n||l,z)}updateWingtipIonRibbons(){let e=this.scratchWingtipL,t=this.scratchWingtipR;this.wingtipL.getWorldPosition(e),this.wingtipR.getWorldPosition(t);for(let e=47;e>0;e--)this.ribbonHistoryL[e].copy(this.ribbonHistoryL[e-1]),this.ribbonHistoryR[e].copy(this.ribbonHistoryR[e-1]),this.ribbonHistoryL[e].z+=.22,this.ribbonHistoryR[e].z+=.22;this.ribbonHistoryL[0].copy(e),this.ribbonHistoryR[0].copy(t);let n=(e,t,n)=>{for(let n=0;n<e_;n++){let r=e[n],i=(1-n/47)*.2,a=n*6;t[a]=r.x-i,t[a+1]=r.y,t[a+2]=r.z,t[a+3]=r.x+i,t[a+4]=r.y,t[a+5]=r.z}n.attributes.position.needsUpdate=!0};n(this.ribbonHistoryL,this.leftRibbonPos,this.leftRibbonGeo),n(this.ribbonHistoryR,this.rightRibbonPos,this.rightRibbonGeo)}updatePlasmaParticles(e,t,n){let r=this.scratchNozzleTipL,i=this.scratchNozzleTipR,a=this.scratchNozzleTipC;this.nozzleTipL.getWorldPosition(r),this.nozzleTipR.getWorldPosition(i),this.nozzleTipCenter.getWorldPosition(a);let o=this.scratchExhaustDir.set(0,.04,1).applyQuaternion(this.chassis.quaternion).normalize(),s=t?10:6;for(let e=0;e<s;e++)this.spawnSinglePlasmaParticle(r,o,t,n,0),this.spawnSinglePlasmaParticle(i,o,t,n,1),this.spawnSinglePlasmaParticle(a,o,t,n,2);for(let t=0;t<t_;t++){let n=this.plasmaParticles[t];if(n.age>=n.maxAge){this.plasmaPositions[t*3+1]=-999;continue}n.age+=e,n.isEmber&&(n.vx+=Math.sin(this.elapsed*22+t)*3*e,n.vy+=Math.cos(this.elapsed*18+t)*2.2*e),this.plasmaPositions[t*3]+=n.vx*e,this.plasmaPositions[t*3+1]+=n.vy*e,this.plasmaPositions[t*3+2]+=n.vz*e;let r=Math.max(0,1-n.age/n.maxAge);this.plasmaColors[t*3]=n.color.r*r,this.plasmaColors[t*3+1]=n.color.g*r,this.plasmaColors[t*3+2]=n.color.b*r}this.plasmaGeo.attributes.position.needsUpdate=!0,this.plasmaGeo.attributes.color.needsUpdate=!0}spawnSinglePlasmaParticle(e,t,n,r,i){let a=this.plasmaSpawnCursor;this.plasmaSpawnCursor=(this.plasmaSpawnCursor+1)%t_;let o=this.plasmaParticles[a];o.age=0,o.isEmber=i===2||a%3==0,o.maxAge=o.isEmber?.34+Math.random()*.36:.22+Math.random()*.2;let s=o.isEmber?n_[a%2==0?2:3]:i===0?n_[0]:n_[1];o.color.setHex(s);let c=n?.22:.14;this.plasmaPositions[a*3]=e.x+(Math.random()-.5)*c,this.plasmaPositions[a*3+1]=e.y+(Math.random()-.5)*c,this.plasmaPositions[a*3+2]=e.z+(Math.random()-.5)*c;let l=(n?28:17+r*6)+Math.random()*6;o.vx=t.x*l+(Math.random()-.5)*(o.isEmber?3.5:2.2)+this.vel.x*.18,o.vy=t.y*l+(Math.random()-.5)*(o.isEmber?2.8:1.6),o.vz=t.z*l+(Math.random()-.5)*2.2}},l_=5,u_=4.35,d_=12.2,f_=14,p_=36,m_=900,h_=1600,g_=36,__=1800,v_=6,y_=360,b_=18,x_=4,S_=90,C_=2.1,w_=class e{canvas;gameState;webglRenderer;scene;camera;vfx;textures;ship;ambientLight;dirLight;skyDomeMesh;skyDomeMat;rowSlots=[];planets=[];distantSupernovas=[];shootingStars=[];asteroids=[];nebulaClouds=[];alienUfoGroup;alienTractorBeam;isAbductionActive=!1;starfieldGeo;starfieldPositions;nebulaFlowGeo;nebulaFlowPositions;nebulaFlowColors;nebulaFlowPhases;cosmicDustGeo;cosmicDustPositions;trajectoryLine;trajectoryPositions;trajectoryMat;raycaster=new Gs;pointerNdc=new Y;lastHoverNdc=new Y;lastValidHoverTime=0;interactiveHitboxMeshes=[];hoveredLane=null;hoveredRow=null;lastHoveredLaneAudio=null;camPos=new X(0,5.2,7.8);camVel=new X(0,0,0);camLookAt=new X(0,1.45,-7.5);mouseParallax=new Y(0,0);scratchSkyColor=new Z;scratchFogColor=new Z;scratchTintColor=new Z;scratchDesiredLook=new X;scratchTrajStart=new X;scratchTrajEnd=new X;scratchTrajMid=new X;scratchTrajTmp=new X;scratchProjVec=new X;static currentLaneSpacingX=u_;cardLayoutScale=1;width=1280;height=720;elapsed=0;lastFrameTime=performance.now();constructor(e,t){this.canvas=e,this.gameState=t,this.initThreeEngine(),this.textures=Gg(),this.buildHdrLightingAndAtmosphere(),this.buildPhotorealisticGalacticSkyDome(),this.buildDeepSpaceCosmicVoid(),this.buildDistantPlanetsWithCityLightsAndAsteroidRings(),this.buildDistantSupernovas(),this.buildShootingStars(),this.buildAsteroidField(),this.buildFloatingMultiplierCardsPool(),this.buildTrajectoryPredictor(),this.buildAlienUfoSaucer(),this.ship=new c_(this.scene,this.textures),this.ship.snapTo(0,C_,0),this.vfx=new $g(this.webglRenderer,this.scene,this.camera,this.width,this.height,this.textures.paintSplatterTex,this.textures.particleGlow),this.setupDPI(!0),this.bindGameEvents(),this.bindGlobalCursorTracking(),this.startRenderLoop()}static laneToWorldX(t){return(t-2)*e.currentLaneSpacingX}static rowToWorldZ(e){return-e*d_}initThreeEngine(){let e=this.canvas.parentElement;this.width=Math.max(360,e?.clientWidth||window.innerWidth),this.height=Math.max(480,e?.clientHeight||window.innerHeight),this.webglRenderer=new pd({canvas:this.canvas,antialias:!0,powerPreference:`high-performance`}),this.webglRenderer.setSize(this.width,this.height,!1),this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.webglRenderer.shadowMap.enabled=!0,this.webglRenderer.shadowMap.type=2,this.webglRenderer.toneMapping=4,this.webglRenderer.toneMappingExposure=.94,this.webglRenderer.outputColorSpace=qt,this.scene=new Kr,this.scene.background=new Z(132106),this.scene.fog=new Gr(132365,.0038),this.camera=new vs(54,this.width/this.height,.2,420),this.camera.position.copy(this.camPos)}buildHdrLightingAndAtmosphere(){let e=new bc(this.webglRenderer);e.compileEquirectangularShader();let t=e.fromEquirectangular(this.textures.hdrEnvEquirectTex);this.scene.environment=t.texture,e.dispose(),this.ambientLight=new os(9741240,593174,1.08),this.scene.add(this.ambientLight),this.dirLight=new Ts(16317180,2.25),this.dirLight.position.set(14,28,16),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.width=1024,this.dirLight.shadow.mapSize.height=1024,this.dirLight.shadow.camera.near=2,this.dirLight.shadow.camera.far=110,this.dirLight.shadow.camera.left=-30,this.dirLight.shadow.camera.right=30,this.dirLight.shadow.camera.top=30,this.dirLight.shadow.camera.bottom=-30,this.dirLight.shadow.bias=-5e-4,this.scene.add(this.dirLight),this.scene.add(this.dirLight.target)}buildPhotorealisticGalacticSkyDome(){let e=new Co(330,64,48);this.skyDomeMat=new Po({uniforms:{uTime:{value:0},uSectorTint:{value:new Z(959977)}},vertexShader:`
                varying vec3 vDir;
                void main() {
                    vDir = normalize(position);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,fragmentShader:`
                uniform float uTime;
                uniform vec3 uSectorTint;
                varying vec3 vDir;

                float hash31(vec3 p) {
                    p = fract(p * vec3(443.897, 441.423, 437.195));
                    p += dot(p, p.yzx + 19.19);
                    return fract((p.x + p.y) * p.z);
                }

                float noise3(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(
                            mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
                            mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x),
                            f.y
                        ),
                        mix(
                            mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
                            mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x),
                            f.y
                        ),
                        f.z
                    );
                }

                float fbm3(vec3 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 5; i++) {
                        v += a * noise3(p);
                        p = p * 2.03 + vec3(1.7, 9.2, 3.4);
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    vec3 d = normalize(vDir);

                    // Tilted Galactic Plane Coordinate
                    float galPlane = dot(d, normalize(vec3(0.42, 0.78, 0.46)));
                    float bandMask = exp(-galPlane * galPlane * 7.5);

                    // Domain-warped cosmic gas & dark dust rifts
                    vec3 q = vec3(
                        fbm3(d * 3.2 + vec3(0.0, uTime * 0.004, 0.0)),
                        fbm3(d * 3.2 + vec3(5.2, 1.3, 2.8)),
                        fbm3(d * 3.2 + vec3(2.1, 7.4, 9.1))
                    );
                    float nebulaGas = fbm3(d * 4.5 + q * 1.8);
                    float darkRift = fbm3(d * 6.8 - q * 2.1);

                    // Dark absorption dust lanes cutting across the Milky Way band
                    float dustOcclusion = smoothstep(0.46, 0.72, darkRift) * 0.85;

                    // Realistic Galactic Core (warm gold-ivory) + Ionized H-II / O-III Filaments (teal/crimson/violet)
                    vec3 deepVoid = vec3(0.008, 0.014, 0.032);
                    vec3 galCoreCol = vec3(0.78, 0.68, 0.55) * bandMask * pow(nebulaGas, 1.5) * 0.52;
                    vec3 ionizedCyan = mix(vec3(0.06, 0.45, 0.68), uSectorTint, 0.35) * smoothstep(0.45, 0.82, nebulaGas) * 0.28;
                    vec3 hAlphaRose = vec3(0.62, 0.16, 0.38) * smoothstep(0.52, 0.88, q.x * nebulaGas) * bandMask * 0.32;

                    vec3 skyCol = deepVoid + (galCoreCol + ionizedCyan + hAlphaRose) * (1.0 - dustOcclusion);

                    // Sub-pixel background starfield glittering in the sky dome
                    float starCell = hash31(floor(d * 420.0));
                    float starSpark = smoothstep(0.9965, 1.0, starCell);
                    skyCol += vec3(0.88, 0.94, 1.0) * starSpark * (0.4 + 0.6 * bandMask);

                    gl_FragColor = vec4(skyCol, 1.0);
                }
            `,side:1,depthWrite:!1}),this.skyDomeMesh=new Q(e,this.skyDomeMat),this.skyDomeMesh.frustumCulled=!1,this.scene.add(this.skyDomeMesh)}buildDeepSpaceCosmicVoid(){this.starfieldGeo=new Bi,this.starfieldPositions=new Float32Array(__*3);let e=new Float32Array(__*3);for(let t=0;t<__;t++){let n=Math.random()*Math.PI*2,r=14+Math.random()*92;this.starfieldPositions[t*3]=Math.cos(n)*r,this.starfieldPositions[t*3+1]=Math.sin(n)*r*.75,this.starfieldPositions[t*3+2]=-Math.random()*270;let i=new Z(t%3==0?8246268:t%5==0?16638023:t%7==0?12616956:16777215);e[t*3]=i.r,e[t*3+1]=i.g,e[t*3+2]=i.b}this.starfieldGeo.setAttribute(`position`,new Ti(this.starfieldPositions,3)),this.starfieldGeo.setAttribute(`color`,new Ti(e,3));let t=new to({size:.65,map:this.textures.particleGlow,vertexColors:!0,transparent:!0,opacity:.85,blending:2,depthWrite:!1}),n=new oo(this.starfieldGeo,t);n.frustumCulled=!1,this.scene.add(n);let r=[this.textures.cartoonCloudTex,this.textures.nebulaPillarTex,this.textures.nebulaVeilTex],i=[.54,.11,.88,.58,.76,.48];for(let e=0;e<p_;e++){let t=i[e%i.length],n=new Z().setHSL(t,.68,.72),a=new Xi({map:r[e%r.length],color:n,transparent:!0,opacity:.46,blending:2,depthWrite:!1,rotation:e*1.1%(Math.PI*2)}),o=new ua(a),s=e%2==0?-1:1,c=e%5==0?(Math.random()-.5)*48:s*(16+Math.random()*38),l=e%5==0?-16-Math.random()*14:-12+Math.random()*34,u=-Math.random()*250;o.position.set(c,l,u);let d=24+Math.random()*28;o.scale.set(d,d*.82,1),this.scene.add(o),this.nebulaClouds.push({sprite:o,mat:a,baseX:c,baseY:l,offsetZ:u,driftSpeedZ:8+Math.random()*12,baseHue:t})}this.nebulaFlowGeo=new Bi,this.nebulaFlowPositions=new Float32Array(m_*3),this.nebulaFlowColors=new Float32Array(m_*3),this.nebulaFlowPhases=new Float32Array(m_);for(let e=0;e<m_;e++){let t=(e%2==0?-1:1)*(14+Math.random()*32),n=-10+Math.random()*28,r=-Math.random()*240;this.nebulaFlowPositions[e*3]=t,this.nebulaFlowPositions[e*3+1]=n,this.nebulaFlowPositions[e*3+2]=r,this.nebulaFlowPhases[e]=Math.random()*Math.PI*2;let i=new Z().setHSL(.52+e%10*.035,.9,.6);this.nebulaFlowColors[e*3]=i.r,this.nebulaFlowColors[e*3+1]=i.g,this.nebulaFlowColors[e*3+2]=i.b}this.nebulaFlowGeo.setAttribute(`position`,new Ti(this.nebulaFlowPositions,3)),this.nebulaFlowGeo.setAttribute(`color`,new Ti(this.nebulaFlowColors,3));let a=new to({size:1.35,map:this.textures.particleGlow,vertexColors:!0,transparent:!0,opacity:.48,blending:2,depthWrite:!1}),o=new oo(this.nebulaFlowGeo,a);o.frustumCulled=!1,this.scene.add(o),this.cosmicDustGeo=new Bi,this.cosmicDustPositions=new Float32Array(h_*3);let s=new Float32Array(h_*3);for(let e=0;e<h_;e++){this.cosmicDustPositions[e*3]=(Math.random()-.5)*44,this.cosmicDustPositions[e*3+1]=(Math.random()-.5)*28+2,this.cosmicDustPositions[e*3+2]=15-Math.random()*145;let t=new Z(e%3==0?14742270:e%3==1?3718648:16707722);s[e*3]=t.r,s[e*3+1]=t.g,s[e*3+2]=t.b}this.cosmicDustGeo.setAttribute(`position`,new Ti(this.cosmicDustPositions,3)),this.cosmicDustGeo.setAttribute(`color`,new Ti(s,3));let c=new to({size:.28,map:this.textures.particleGlow,vertexColors:!0,transparent:!0,opacity:.58,blending:2,depthWrite:!1}),l=new oo(this.cosmicDustGeo,c);l.frustumCulled=!1,this.scene.add(l)}createPlanetSurfaceMaterial(e,t,n,r,i){return new Po({uniforms:{tDay:{value:e},tCityLights:{value:t},tClouds:{value:n},uSunDir:{value:new X(.65,.42,.62).normalize()},uAtmoColor:{value:new Z(r)},uCloudOpacity:{value:i},uTime:{value:0}},vertexShader:`
                varying vec2 vUv;
                varying vec3 vWorldNormal;
                varying vec3 vViewDir;
                varying vec3 vObjPos;
                void main() {
                    vUv = uv;
                    vObjPos = position;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldNormal = normalize(mat3(modelMatrix) * normal);
                    vViewDir = normalize(cameraPosition - worldPos.xyz);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,fragmentShader:`
                uniform sampler2D tDay;
                uniform sampler2D tCityLights;
                uniform sampler2D tClouds;
                uniform vec3 uSunDir;
                uniform vec3 uAtmoColor;
                uniform float uCloudOpacity;
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vWorldNormal;
                varying vec3 vViewDir;
                varying vec3 vObjPos;

                float hash31(vec3 p) {
                    p = fract(p * vec3(443.897, 441.423, 437.195));
                    p += dot(p, p.yzx + 19.19);
                    return fract((p.x + p.y) * p.z);
                }

                float noise3(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(
                            mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
                            mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x),
                            f.y
                        ),
                        mix(
                            mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
                            mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x),
                            f.y
                        ),
                        f.z
                    );
                }

                float fbm3(vec3 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 4; i++) {
                        v += a * noise3(p);
                        p = p * 2.05 + vec3(3.1, 5.7, 1.9);
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    // 1. Compute 3D procedural micro-relief normal perturbation (zero UV seam distortion!)
                    vec3 p3 = vObjPos * 14.0;
                    float h0 = fbm3(p3);
                    float hx = fbm3(p3 + vec3(0.06, 0.0, 0.0)) - h0;
                    float hy = fbm3(p3 + vec3(0.0, 0.06, 0.0)) - h0;
                    vec3 N = normalize(vWorldNormal + vec3(hx, hy, 0.0) * 1.45);
                    vec3 V = normalize(vViewDir);
                    float ndotl = dot(N, uSunDir);
                    float rawNdotL = dot(normalize(vWorldNormal), uSunDir);

                    // 2. Sample Photorealistic Surface Albedo & Drifting Cloud Deck
                    vec3 dayAlbedo = texture2D(tDay, vUv).rgb * (0.84 + 0.32 * h0);
                    vec2 cloudUv = vec2(fract(vUv.x + uTime * 0.008), vUv.y);
                    vec2 shadowUv = cloudUv - vec2(0.006, 0.004);
                    float cloudAlpha = texture2D(tClouds, cloudUv).a * uCloudOpacity;
                    float cloudShadow = texture2D(tClouds, shadowUv).a * uCloudOpacity * 0.55;

                    // 3. Day-Side Diffuse + Specular Ocean/Ice Solar Highlight
                    float diffuse = smoothstep(-0.08, 0.85, ndotl);
                    vec3 H = normalize(uSunDir + V);
                    float oceanMask = smoothstep(0.32, 0.65, dayAlbedo.b - dayAlbedo.r * 0.6);
                    float spec = pow(max(0.0, dot(N, H)), 38.0) * oceanMask * diffuse * 0.78;

                    // Apply cloud shadows onto the surface below, then composite sunlit clouds on top
                    vec3 shadowedSurface = dayAlbedo * (1.0 - cloudShadow);
                    vec3 litSurface = shadowedSurface * (0.04 + diffuse * 1.18) + vec3(1.0, 0.96, 0.88) * spec;

                    // 4. Warm Rayleigh Terminator Sunset Scattering (Amber-Crimson belt along day/night boundary!)
                    float terminatorBand = exp(-pow((rawNdotL - 0.02) * 5.2, 2.0));
                    vec3 sunsetScatter = vec3(1.0, 0.42, 0.14) * terminatorBand * 0.38;

                    // Cloud illumination (bright white on day side, warm orange at terminator)
                    vec3 cloudColor = mix(vec3(1.0, 0.48, 0.22), vec3(0.98, 0.99, 1.0), smoothstep(-0.05, 0.35, rawNdotL));
                    float cloudLit = smoothstep(-0.16, 0.65, rawNdotL);
                    vec3 dayComposite = mix(litSurface, cloudColor * cloudLit * 1.12, cloudAlpha) + sunsetScatter;

                    // 5. Night-Side Megacity & Highway Lights (obscured slightly under heavy clouds!)
                    float nightMask = smoothstep(0.14, -0.24, rawNdotL);
                    vec3 citySample = texture2D(tCityLights, vUv).rgb;
                    vec3 nightCityGlow = citySample * nightMask * (1.0 - cloudAlpha * 0.65) * 1.95;

                    // 6. Atmospheric Rayleigh Fresnel Limb Glow
                    float fresnel = pow(1.0 - max(0.0, dot(normalize(vWorldNormal), V)), 3.2);
                    vec3 atmoRim = uAtmoColor * fresnel * (0.28 + 0.72 * max(0.0, rawNdotL + 0.35));

                    gl_FragColor = vec4(dayComposite + nightCityGlow + atmoRim, 1.0);
                }
            `})}createAtmosphereScatteringMaterial(e){return new Po({uniforms:{uAtmoColor:{value:new Z(e)},uSunDir:{value:new X(.65,.42,.62).normalize()}},vertexShader:`
                varying vec3 vNormal;
                varying vec3 vViewDir;
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vNormal = normalize(mat3(modelMatrix) * normal);
                    vViewDir = normalize(cameraPosition - worldPos.xyz);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,fragmentShader:`
                uniform vec3 uAtmoColor;
                uniform vec3 uSunDir;
                varying vec3 vNormal;
                varying vec3 vViewDir;
                void main() {
                    vec3 N = normalize(vNormal);
                    vec3 V = normalize(vViewDir);
                    float rim = pow(clamp(1.0 + dot(N, V), 0.0, 1.0), 2.5);
                    float sunSide = 0.3 + 0.7 * smoothstep(-0.4, 0.8, dot(-N, uSunDir));
                    gl_FragColor = vec4(uAtmoColor * rim * sunSide * 1.35, rim * 0.72);
                }
            `,side:1,transparent:!0,blending:2,depthWrite:!1})}buildDistantPlanetsWithCityLightsAndAsteroidRings(){let e=new Co(1,64,48),t=new Co(1.12,48,36),n=new So(1.38,2.58,64);n.rotateX(Math.PI/2);let r=new vo(.18,1),i=new Io({map:this.textures.asteroidColor,bumpMap:this.textures.asteroidBump,bumpScale:.08,roughnessMap:this.textures.asteroidRoughness,roughness:.72,metalness:.32}),a=[{tex:this.textures.planetGasGiantTex,hasRing:!0,radius:14,baseX:-43,baseY:16,startZ:-82,atmoColor:3718648,cloudOpacity:.32},{tex:this.textures.planetIceWorldTex,hasRing:!0,radius:10.6,baseX:39,baseY:11,startZ:-142,atmoColor:61695,cloudOpacity:.68},{tex:this.textures.planetLavaWorldTex,hasRing:!1,radius:8.6,baseX:-32,baseY:-13,startZ:-195,atmoColor:16347926,cloudOpacity:.22},{tex:this.textures.planetGasGiantTex,hasRing:!0,radius:15.5,baseX:46,baseY:-9,startZ:-252,atmoColor:11032055,cloudOpacity:.38},{tex:this.textures.planetIceWorldTex,hasRing:!1,radius:8.2,baseX:-29,baseY:22,startZ:-44,atmoColor:3718648,cloudOpacity:.72},{tex:this.textures.planetLavaWorldTex,hasRing:!0,radius:11.6,baseX:36,baseY:20,startZ:-298,atmoColor:16096779,cloudOpacity:.25}],o=new Ir;for(let s=0;s<v_;s++){let c=a[s],l=new Lr,u=this.createPlanetSurfaceMaterial(c.tex,this.textures.planetCityLightsTex,this.textures.planetCloudsTex,c.atmoColor,c.cloudOpacity),d=new Q(e,u);d.scale.setScalar(c.radius),d.rotation.z=(s%2==0?1:-1)*.26,l.add(d);let f=new Q(t,this.createAtmosphereScatteringMaterial(c.atmoColor));f.scale.setScalar(c.radius),l.add(f);let p=null;if(c.hasRing){p=new Lr,p.rotation.x=.38,p.rotation.z=(s%2==0?1:-1)*.24;let e=new Q(n,new _a({map:this.textures.planetRingTex,transparent:!0,opacity:.68,side:2,depthWrite:!1}));e.scale.setScalar(c.radius),p.add(e);let t=new Ba(r,i,y_);for(let e=0;e<y_;e++){let n=e/y_*Math.PI*2+Math.random()*.15,r=e%3==0?1.44+Math.random()*.42:1.98+Math.random()*.56,i=c.radius*r,a=Math.cos(n)*i,s=Math.sin(n)*i,l=(Math.random()-.5)*.45;o.position.set(a,l,s),o.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);let u=(.45+Math.random()*1.35)*(c.radius/11);o.scale.set(u*1.2,u*.85,u),o.updateMatrix(),t.setMatrixAt(e,o.matrix)}t.instanceMatrix.needsUpdate=!0,p.add(t),l.add(p)}l.position.set(c.baseX,c.baseY,c.startZ),this.scene.add(l),this.planets.push({group:l,sphereMesh:d,surfaceMat:u,atmoMesh:f,ringSystemGroup:p,rotSpeedY:.14+s%3*.06,driftSpeedZ:7.5+s%3*2.5,baseX:c.baseX,baseY:c.baseY})}}buildDistantSupernovas(){let e=new So(.8,1.35,36),t=new go(.65,16,12,1,!0),n=[{x:-52,y:26,z:-165,col:16638023},{x:54,y:24,z:-230,col:61695},{x:-140,y:-45,z:-320,col:11032055},{x:48,y:28,z:-290,col:16347926}];for(let r=0;r<x_;r++){let i=n[r],a=new Lr;a.position.set(i.x,i.y,i.z);let o=new ua(new Xi({map:this.textures.particleGlow,color:i.col,transparent:!0,opacity:.9,blending:2,depthWrite:!1}));o.scale.setScalar(14),a.add(o);let s=new _a({color:i.col,transparent:!0,opacity:.75,side:2,blending:2,depthWrite:!1}),c=new Q(e,s);a.add(c);let l=new Lr,u=new _a({color:i.col,transparent:!0,opacity:.28,side:2,blending:2,depthWrite:!1});for(let e=0;e<6;e++){let n=new Q(t,u);n.rotation.z=e*Math.PI/3,l.add(n)}a.add(l),this.scene.add(a),this.distantSupernovas.push({group:a,coreSprite:o,shockRing:c,shockMat:s,rayGroup:l,rayMat:u,age:r*1.8,cycleDuration:6.5+r*1.2,baseX:i.x,baseY:i.y,baseZ:i.z})}}buildShootingStars(){let e=new ho(0,.14,10.5,8);e.rotateX(Math.PI/2),e.translate(0,0,-5.25);for(let t=0;t<b_;t++){let n=new Lr,r=new _a({color:t%4==0?16638023:8246268,transparent:!0,opacity:.85,blending:2,depthWrite:!1}),i=new Q(e,r);n.add(i);let a=new ua(new Xi({map:this.textures.particleGlow,color:16777215,transparent:!0,opacity:.95,blending:2,depthWrite:!1}));a.scale.setScalar(1.35),n.add(a),this.scene.add(n);let o={group:n,vel:new X,age:Math.random()*2.5,maxAge:1.4+Math.random()*1.4,tailMat:r,headSprite:a};this.respawnShootingStar(o,0),this.shootingStars.push(o)}}respawnShootingStar(e,t){e.age=0,e.maxAge=1.2+Math.random()*1.5;let n=Math.random()>.5,r=(n?-1:1)*(24+Math.random()*44),i=8+Math.random()*28,a=t-55-Math.random()*165;e.group.position.set(r,i,a);let o=(n?1:-1)*(36+Math.random()*34),s=-(10+Math.random()*18),c=16+Math.random()*28;e.vel.set(o,s,c);let l=e.group.position.clone().add(e.vel);e.group.lookAt(l)}buildAsteroidField(){let e=new yo(1.6,3),t=e.attributes.position,n=new X;for(let e=0;e<t.count;e++){n.fromBufferAttribute(t,e);let r=Math.sin(n.x*2.4+n.y*1.9)*Math.cos(n.z*2.2),i=Math.sin(n.x*5.3-n.z*4.7)*.08,a=1+.24*r+i;n.multiplyScalar(a),t.setXYZ(e,n.x,n.y,n.z)}e.computeVertexNormals();let r=new Io({map:this.textures.asteroidColor,bumpMap:this.textures.asteroidBump,bumpScale:.22,roughnessMap:this.textures.asteroidRoughness,roughness:.78,metalness:.28});for(let t=0;t<g_;t++){let n=new Q(e,r),i=(t%2==0?-1:1)*(15.5+Math.random()*24),a=-8+Math.random()*26,o=-Math.random()*220;n.position.set(i,a,o);let s=.65+Math.random()*1.95;n.scale.set(s*(.8+Math.random()*.4),s*(.7+Math.random()*.5),s*(.8+Math.random()*.4)),n.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI),this.scene.add(n),this.asteroids.push({mesh:n,rotSpeedX:(Math.random()-.5)*1.8,rotSpeedY:(Math.random()-.5)*1.8,rotSpeedZ:(Math.random()-.5)*1.8,driftSpeedZ:14+Math.random()*20,baseX:i,baseY:a})}}createOutline(e,t=.075,n,r){let i=e.clone(),a=i.attributes.position,o=i.attributes.normal;if(a&&o){for(let e=0;e<a.count;e++)a.setXYZ(e,a.getX(e)+o.getX(e)*t,a.getY(e)+o.getY(e)*t,a.getZ(e)+o.getZ(e)*t);i.computeVertexNormals()}let s=new Q(i,new _a({color:328968,side:1,depthWrite:!0}));return n&&s.position.copy(n),r&&s.rotation.copy(r),s.renderOrder=-1,s}buildFloatingMultiplierCardsPool(){let e=new mo(4.24,3.95,2.95),t=new _a({transparent:!0,opacity:0,depthWrite:!1}),n=new mo(2.1,1.8,1.8),r=new mo(1.06,.06,1.82),i=new Co(.52,16,14),a=new Co(.68,24,20),o=new ho(.69,.69,.22,24,1,!0),s=new ho(.18,.22,.22,16),c=new To(.18,.045,8,16,Math.PI*.95),l=new bo(.09,0),u=new Io({map:this.textures.cardboardBoxTex,roughness:.88,metalness:.05}),d=new Io({map:this.textures.cardboardOrangeBoxTex,emissive:16096779,emissiveIntensity:.38,roughness:.75,metalness:.08}),f=new Io({map:this.textures.cardboardAlienBoxTex,emissive:9133302,emissiveIntensity:.42,roughness:.75,metalness:.08}),p=new Io({color:1120295,roughness:.18,metalness:.85}),m=new Io({color:16638023,emissive:16096779,emissiveIntensity:.85,roughness:.25,metalness:.3}),h=new Io({color:14251782,roughness:.3,metalness:.8}),g=new Io({color:13948120,roughness:.9,metalness:0}),_=new _a({color:16638023});for(let v=0;v<f_;v++){let y=[];for(let b=0;b<l_;b++){let x=new Lr,S=new Lr;x.add(S);let C=new Q(e,t);C.position.set(0,1.35,0),C.userData={isVaultPlatform:!0,slotIndex:v,lane:b},x.add(C),this.interactiveHitboxMeshes.push(C);let w=new Lr,T=new Q(n,u);T.position.set(0,.95,0);let E=this.createOutline(n,.08,T.position);w.add(T,E);let D=new Lr;D.position.set(-1.05,1.85,0);let O=new Q(r,u);O.position.set(.53,0,0);let k=this.createOutline(r,.06,O.position);D.add(O,k);let A=new Lr;A.position.set(1.05,1.85,0);let j=new Q(r,u);j.position.set(-.53,0,0);let M=this.createOutline(r,.06,j.position);A.add(j,M),w.add(D,A),S.add(w);let N=new Lr;N.position.set(0,.95,0);let P=new Q(i,new _a({color:16773258})),F=new ua(new Xi({map:this.textures.miniSunTex,blending:2,transparent:!0,opacity:.9}));F.scale.set(2.4,2.4,1),N.add(P,F,this.createOutline(i,.07)),N.visible=!1,S.add(N);let I=new Lr;I.position.set(0,.85,0);let L=new Q(a,p),ee=this.createOutline(a,.08),te=new Q(o,m),ne=new Q(s,h);ne.position.y=.68;let R=this.createOutline(s,.065,ne.position),re=new Q(c,g);re.rotation.z=Math.PI/2,re.position.set(.08,.85,0);let z=new Q(l,_);z.position.set(.18,1.02,0),I.add(L,ee,te,ne,R,re,z),I.visible=!1,S.add(I);let ie=document.createElement(`canvas`);ie.width=256,ie.height=104;let ae=new lo(ie);ae.colorSpace=qt;let oe=new Xi({map:ae,transparent:!0,depthTest:!1}),B=new ua(oe);B.position.set(0,2.85,0),B.scale.set(3.25,1.32,1),B.visible=!1,S.add(B),this.scene.add(x),y.push({group:x,visualGroup:S,hitboxMesh:C,mysteryBoxGroup:w,boxBody:T,boxBodyOutline:E,lidLeft:D,lidRight:A,lidFlapL:O,lidFlapR:j,lidOutlineL:k,lidOutlineR:M,boxMatNormal:u,boxMatOrange:d,boxMatAlien:f,miniSunGroup:N,miniSunCore:P,miniSunCorona:F,mineGroup:I,badgeCanvas:ie,badgeTex:ae,badgeSprite:B,badgeMat:oe,lastBadgeSignature:``,boxType:`normal`,lidOpenProgress:0,isShattered:!1,assignedRow:v+1,lane:b})}this.rowSlots.push(y)}}buildTrajectoryPredictor(){this.trajectoryPositions=new Float32Array(99);let e=new Bi;e.setAttribute(`position`,new Ti(this.trajectoryPositions,3)),this.trajectoryMat=new Ga({color:3718648,transparent:!0,opacity:.9}),this.trajectoryLine=new $a(e,this.trajectoryMat),this.trajectoryLine.frustumCulled=!1,this.trajectoryLine.visible=!1,this.scene.add(this.trajectoryLine)}buildAlienUfoSaucer(){this.alienUfoGroup=new Lr,this.alienUfoGroup.visible=!1,this.scene.add(this.alienUfoGroup);let e=new ho(1.4,2.5,.44,24),t=new Q(e,new Io({color:1976635,roughness:.22,metalness:.88}));this.alienUfoGroup.add(t,this.createOutline(e,.08));let n=new Co(.88,20,14,0,Math.PI*2,0,Math.PI*.5),r=new Q(n,new Lo({color:61695,roughness:.05,metalness:.3,transmission:.85,transparent:!0,opacity:.88}));r.position.y=.22,this.alienUfoGroup.add(r,this.createOutline(n,.07,r.position));for(let e=0;e<8;e++){let t=e*Math.PI/4,n=new Q(new Co(.12,12,8),new _a({color:e%2==0?61695:11032055}));n.position.set(Math.cos(t)*2.3,0,Math.sin(t)*2.3),this.alienUfoGroup.add(n)}let i=new ho(.35,2.6,9.5,20,1,!0),a=new _a({color:61695,transparent:!0,opacity:.55,blending:2,side:2,depthWrite:!1});this.alienTractorBeam=new Q(i,a),this.alienTractorBeam.position.y=-4.75,this.alienUfoGroup.add(this.alienTractorBeam)}triggerAlienAbductionSequence(t,n,r){this.isAbductionActive=!0,this.alienUfoGroup.visible=!0,this.alienUfoGroup.position.set(t,22,n),this.alienTractorBeam.scale.set(.1,1,.1);let i=this.gameState.engine.currentRow,a=e.rowToWorldZ(i);xe.playAlienLaser();let o=this.rowSlots.flat().find(e=>Math.abs(e.group.position.z-n)<1.2&&Math.abs(e.group.position.x-t)<1.2);o&&(Sg.killTweensOf(o.visualGroup.position),Sg.to(o.visualGroup.position,{y:4.8,duration:.45,delay:.38,ease:`power2.inOut`,onComplete:()=>{o.mysteryBoxGroup.visible=!1,o.visualGroup.position.y=0}})),Sg.killTweensOf(this.alienUfoGroup.position),Sg.killTweensOf(this.alienTractorBeam.scale),Sg.killTweensOf(this.ship.pos),Sg.to(this.alienUfoGroup.position,{y:8.5,duration:.38,ease:`back.out(1.4)`,onComplete:()=>{Sg.to(this.alienTractorBeam.scale,{x:1,z:1,duration:.22,ease:`power2.out`}),Sg.to(this.ship.pos,{y:4.8,duration:.45,ease:`power2.inOut`,onComplete:()=>{this.vfx.spawnSafeBurst3D(t,4.8,n,!0),this.ship.pos.set(t,4.8,a),this.alienUfoGroup.position.set(t,8.5,a),this.ship.targetPos.set(t,C_,a),Sg.to(this.ship.pos,{y:C_,duration:.35,ease:`bounce.out`,onComplete:()=>{Sg.to(this.alienUfoGroup.position,{y:28,duration:.4,ease:`power2.in`,onComplete:()=>{this.alienUfoGroup.visible=!1,this.isAbductionActive=!1}})}})}})}})}bindGlobalCursorTracking(){let e=(e,t)=>{let n=this.canvas.getBoundingClientRect();if(n.width<=0||n.height<=0)return;let r=((e-n.left)/n.width-.5)*2,i=((t-n.top)/n.height-.5)*2;this.mouseParallax.set(J.clamp(r,-1,1),J.clamp(i,-1,1)),this.ship.setCursorAim(this.mouseParallax.x,this.mouseParallax.y)};window.addEventListener(`pointermove`,t=>{t.pointerType===`touch`?(this.mouseParallax.set(0,0),this.ship.setCursorAim(0,0)):e(t.clientX,t.clientY)})}bindGameEvents(){let t=this.gameState.engine;t.onStateChange(e=>{e===U.PLAYING&&t.currentRow===1&&t.currentPicks.length===0?(this.ship.snapTo(0,C_,0),this.vfx.clearGraffitiTags()):e===U.IDLE&&(this.vfx.clearGraffitiTags(),this.ship.vel.set(0,0,0),this.camVel.set(0,0,0),this.ship.pos.z<-14&&(this.ship.pos.set(0,C_,-12),this.camPos.set(0,8.65,-.8)),this.ship.setTargetPosition(0,C_,0))}),this.gameState.onHitStopStart((n,r)=>{let i=e.laneToWorldX(r),a=e.rowToWorldZ(n);r===t.getSpecialsForRow(n).alienLane?this.ship.setTargetPosition(i,C_,a+2.4):this.ship.setTargetPosition(i,C_,a)}),this.gameState.onHitStopResolve(n=>{let r=e.laneToWorldX(n.lane),i=e.rowToWorldZ(n.row);n.isSafe?(n.specialType===`NONE`?(this.vfx.spawnVolumetricCardboardShatter3D(r,.95,i,`normal`),this.ship.triggerSpeedBurst(.44),this.vfx.spawnGraffitiMultiplierTag3D(r,.8,i,n.stepMultiplierAfter,n.row),this.vfx.spawnSafeBurst3D(r,.3,i,!1)):n.specialType===`GOLDEN`?(this.vfx.spawnGpuParticleCloud(r,1.4,i,140,[16638023,16096779,15357964,16777215],10,24,.55),this.ship.triggerSpeedBurst(.65),this.vfx.spawnGraffitiMultiplierTag3D(r,1.4,i,n.stepMultiplierAfter,n.row)):n.specialType===`ALIEN`&&this.triggerAlienAbductionSequence(r,i,n.rowsSkipped),t.getHazardsForActionRow(n.row).some(e=>Math.abs(e-n.lane)===1)&&n.specialType!==`ALIEN`&&(this.vfx.triggerScreenShake(.32,.22),this.vfx.spawnGpuParticleCloud(r,.8,i,140,[16638023,16096779,16777215],6,18,.45))):(n.specialType===`NONE`&&this.vfx.spawnVolumetricCardboardShatter3D(r,.95,i,`normal`),this.ship.crashExplosionTimer=.001,this.vfx.spawnCrashExplosion3D(r,.3,i))}),t.onCashout((e,t)=>{this.vfx.triggerSupernovaExplosion3D(this.ship.pos.x,this.ship.pos.y,this.ship.pos.z,t>=2),this.ship.triggerHydraulicBlockParty(4)})}setupDPI(t=!1){let n=this.canvas.parentElement,r=Math.max(280,n?.clientWidth||window.innerWidth),i=Math.max(240,n?.clientHeight||window.innerHeight);if(!t&&r===this.width&&i===this.height)return;this.width=r,this.height=i;let a=this.width/this.height;a<.72?(e.currentLaneSpacingX=3.18,this.cardLayoutScale=.75,this.ship?.root.scale.setScalar(.73)):a<1.05?(e.currentLaneSpacingX=3.68,this.cardLayoutScale=.86,this.ship?.root.scale.setScalar(.84)):(e.currentLaneSpacingX=u_,this.cardLayoutScale=1,this.ship?.root.scale.setScalar(1)),this.camera.aspect=a,this.camera.updateProjectionMatrix(),this.webglRenderer.setSize(this.width,this.height,!1),this.vfx?.setSize(this.width,this.height)}getClickTarget(t,n,r){let i=this.canvas.getBoundingClientRect();this.pointerNdc.x=(t-i.left)/i.width*2-1,this.pointerNdc.y=-((n-i.top)/i.height)*2+1,this.raycaster.setFromCamera(this.pointerNdc,this.camera);let a=this.raycaster.intersectObjects(this.interactiveHitboxMeshes,!1);for(let e of a){let t=e.object,n=t.userData.slotIndex,i=t.userData.lane,a=this.rowSlots[n]?.[i];if(a&&a.group.visible&&a.assignedRow===r)return{row:a.assignedRow,lane:a.lane}}let o=e.rowToWorldZ(r),s=null,c=1/0,l=Math.max(42,i.width*.115),u=Math.max(66,i.height*.095);for(let r=0;r<l_;r++){let a=e.laneToWorldX(r);this.scratchProjVec.set(a,1.12*this.cardLayoutScale,o),this.scratchProjVec.project(this.camera);let d=i.left+(this.scratchProjVec.x*.5+.5)*i.width,f=i.top+(-this.scratchProjVec.y*.5+.5)*i.height,p=Math.abs(t-d),m=Math.abs(n-f);if(p<=l&&m<=u){let e=p*p+m*m*.65;e<c&&(c=e,s=r)}}if(s!==null)return{row:r,lane:s};if(a.length>0){let e=a[0].object,t=e.userData.slotIndex,n=e.userData.lane,r=this.rowSlots[t]?.[n];if(r&&r.group.visible)return{row:r.assignedRow,lane:r.lane}}return this.hoveredRow===r&&this.hoveredLane!==null&&performance.now()-this.lastValidHoverTime<=S_*1.6?{row:this.hoveredRow,lane:this.hoveredLane}:null}updateHover(e,t,n){let r=this.canvas.getBoundingClientRect(),i=(e-r.left)/r.width*2-1,a=-((t-r.top)/r.height)*2+1;this.mouseParallax.x=J.clamp(i,-1,1),this.mouseParallax.y=J.clamp(-a,-1,1),this.ship.setCursorAim(this.mouseParallax.x,this.mouseParallax.y),this.pointerNdc.set(i,a),this.raycaster.setFromCamera(this.pointerNdc,this.camera);let o=this.raycaster.intersectObjects(this.interactiveHitboxMeshes,!1),s=null;for(let e of o){let t=e.object.userData.slotIndex,r=e.object.userData.lane,i=this.rowSlots[t]?.[r];if(i&&i.group.visible&&i.assignedRow===n){s=i;break}}let c=performance.now();if(s){this.hoveredRow=s.assignedRow,this.hoveredLane=s.lane,this.lastValidHoverTime=c,this.lastHoverNdc.set(i,a),this.canvas.style.cursor=`pointer`,this.lastHoveredLaneAudio!==s.lane&&(this.lastHoveredLaneAudio=s.lane,xe.playHoverTick(s.lane));return}let l=Math.hypot(i-this.lastHoverNdc.x,a-this.lastHoverNdc.y);this.hoveredLane!==null&&this.hoveredRow===n&&(c-this.lastValidHoverTime<S_||l<.048)?this.canvas.style.cursor=`pointer`:(this.hoveredRow=null,this.hoveredLane=null,this.lastHoveredLaneAudio=null,this.canvas.style.cursor=`default`)}clearHover(){this.hoveredRow=null,this.hoveredLane=null,this.lastHoveredLaneAudio=null,this.mouseParallax.set(0,0),this.ship.setCursorAim(0,0),this.canvas.style.cursor=`default`}startRenderLoop(){let e=t=>{let n=Math.min(.05,Math.max(.001,(t-this.lastFrameTime)/1e3));this.lastFrameTime=t,this.elapsed+=n,this.updateScene3D(n),this.vfx.composer.render(),requestAnimationFrame(e)};requestAnimationFrame(e)}updateScene3D(t){let n=this.gameState.engine,r=this.gameState.getAtmosphereTheme(),i=n.state===U.PLAYING,a=n.state===U.CRASHED,o=this.gameState.isHitStopActive,s=.92+Math.min(.24,Math.log10(Math.max(1,n.currentMultiplier))*.14);this.webglRenderer.toneMappingExposure=J.lerp(this.webglRenderer.toneMappingExposure,s,t*4);let c=this.scratchSkyColor.setHex(r.bgTopHex),l=this.scratchFogColor.setHex(r.bgBottomHex);this.scene.background.lerp(c,t*3.5),this.scene.fog.color.lerp(l,t*3.5),this.skyDomeMesh.position.copy(this.camera.position),this.skyDomeMat.uniforms.uTime.value=this.elapsed,this.skyDomeMat.uniforms.uSectorTint.value.lerp(this.scratchTintColor.setHex(r.primaryHex),t*2.5);let u=0,d=2;if(o&&this.gameState.hitStopRow!==null&&this.gameState.hitStopLane!==null)u=this.gameState.hitStopRow,d=this.gameState.hitStopLane;else if((i||a)&&n.currentPicks.length>0){let e=n.currentPicks[n.currentPicks.length-1];u=e.row+(e.rowsSkipped||0),d=e.lane}let f=e.laneToWorldX(d),p=e.rowToWorldZ(u);this.ship.setTargetPosition(f,C_,p);let m=o&&this.gameState.hitStopLane!==null?e.laneToWorldX(this.gameState.hitStopLane):null,h=i&&this.hoveredLane!==null?e.laneToWorldX(this.hoveredLane):null,g=n.currentMultiplier||1,_=n.state===U.WON;this.ship.update(t,r.primaryHex,o,m,h,!1,a,g,_),this.updateOrbitalTacticalCamera(t,o,m,h),this.dirLight.position.set(this.ship.pos.x+14,28,this.ship.pos.z+16),this.dirLight.target.position.set(this.ship.pos.x,0,this.ship.pos.z-12),this.updateFloatingMultiplierCards(t,r.primaryHex),this.updateDeepSpaceEnvironment(t),this.updateTrajectoryArc(i,o,r.primaryHex),this.vfx.update(t,n.currentMultiplier,o,this.gameState.hitStopProgress,this.ship.pos)}updateOrbitalTacticalCamera(e,t,n,r){let i=this.width/Math.max(1,this.height),a=i<1,o=a?Math.max(0,(.65-i)*9.5):0,s=a?6.5+o*.55:4.4,c=a?10.5+o:7.2,l=a?-8.5:-9.5,u=a?64:54;if(this.gameState.engine.state===U.CRASHED){let e=Math.min(1,this.ship.crashExplosionTimer/.65);c+=5.2*(1-e),s+=2*(1-e),u+=16.5*(1-e)}else if(t){let e=this.gameState.hitStopProgress;c-=2.85*e,s-=.92*e,u-=8*e}else if(this.ship.postHitStopBurstTimer>0){let e=this.ship.postHitStopBurstTimer/.44;u+=14.5*e}let d=a?.12:.65,f=a?.05:.15,p=a?.12:.55,m=this.ship.pos.x*d+(r===null?0:(r-this.ship.pos.x)*f)+this.mouseParallax.x*p,h=this.ship.pos.y+s-this.mouseParallax.y*.35,g=this.ship.pos.z+c;this.camVel.x+=((m-this.camPos.x)*82-this.camVel.x*14)*e,this.camVel.y+=((h-this.camPos.y)*82-this.camVel.y*14)*e,this.camVel.z+=((g-this.camPos.z)*82-this.camVel.z*14)*e,this.camPos.x+=this.camVel.x*e,this.camPos.y+=this.camVel.y*e,this.camPos.z+=this.camVel.z*e,this.camera.position.copy(this.camPos).add(this.vfx.shakeOffset),Math.abs(this.camera.fov-u)>.05&&(this.camera.fov=J.lerp(this.camera.fov,u,e*15),this.camera.updateProjectionMatrix());let _=a?.1:.45,v=n===null?r===null?this.ship.pos.x*_+this.mouseParallax.x*(a?.15:.8):J.lerp(this.ship.pos.x,r,a?.1:.25):J.lerp(this.ship.pos.x,n,a?.25:.55),y=a?.25:1.05,b=this.scratchDesiredLook.set(v,y-this.mouseParallax.y*(a?.12:.4),this.ship.pos.z+l);this.camLookAt.lerp(b,e*16),this.camera.lookAt(this.camLookAt),this.camera.rotation.z+=-this.ship.roll*.2+this.vfx.shakeRoll}updateFloatingMultiplierCards(t,n){let r=this.gameState.engine,i=r.state===U.PLAYING,a=i?r.currentRow:Math.max(1,r.currentRow),o=Math.max(1,Math.floor(-this.ship.pos.z/d_)),s=i?Math.max(1,Math.min(a-1,o)):Math.max(1,a-1);for(let n=0;n<f_;n++){let a=s+n,o=e.rowToWorldZ(a),c=i&&a===r.currentRow,l=r.currentPicks.find(e=>e.row===a);for(let s=0;s<l_;s++){let u=this.rowSlots[n][s];u.assignedRow=a,u.group.visible=!0;let d=e.laneToWorldX(s),f=c&&this.hoveredLane===s&&this.hoveredRow===a,p=this.gameState.isHitStopActive&&this.gameState.hitStopRow===a&&this.gameState.hitStopLane===s,m=r.getSpecialsForRow(a),h=`normal`;s===m.alienLane?h=`alien`:s===m.goldenLane&&(h=`orange`),u.boxType=h;let g=h===`orange`?u.boxMatOrange:h===`alien`?u.boxMatAlien:u.boxMatNormal;u.boxBody.material!==g&&(u.boxBody.material=g,u.lidFlapL.material=g,u.lidFlapR.material=g),u.group.position.set(d,0,o),u.group.scale.setScalar(this.cardLayoutScale);let _=p?.45:f?.28:Math.sin(this.elapsed*3.2+s*.8+a*.5)*.08;u.visualGroup.position.y=J.lerp(u.visualGroup.position.y,_,Math.min(1,t*16));let v=p?1.08:f?1.05:1;u.visualGroup.scale.setScalar(J.lerp(u.visualGroup.scale.x,v,Math.min(1,t*16)));let y=0;h!==`normal`&&(p?y=1:f&&(y=.42)),u.lidOpenProgress=J.lerp(u.lidOpenProgress,y,Math.min(1,t*14));let b=u.lidOpenProgress*(Math.PI*.65);if(u.lidLeft.rotation.z=b,u.lidRight.rotation.z=-b,u.mysteryBoxGroup.visible=!0,u.miniSunGroup.visible=!1,u.mineGroup.visible=!1,u.badgeSprite.visible=!1,p&&h!==`normal`&&(r.getHazardsForActionRow(a).includes(s)?(u.mineGroup.visible=u.lidOpenProgress>.12,u.mineGroup.position.y=.85+u.lidOpenProgress*.4,u.mineGroup.rotation.y=this.elapsed*2.8):h===`orange`&&(u.miniSunGroup.visible=u.lidOpenProgress>.12,u.miniSunGroup.position.y=1+u.lidOpenProgress*.55+Math.sin(this.elapsed*4)*.08,u.miniSunGroup.rotation.y=this.elapsed*3.2)),l){let e=l.lane===s,t=l.hazards.includes(s);e?l.isSafe?l.specialType===`NONE`?u.mysteryBoxGroup.visible=!1:l.specialType===`GOLDEN`?(u.mysteryBoxGroup.visible=!0,u.lidOpenProgress=1,u.lidLeft.rotation.z=Math.PI*.65,u.lidRight.rotation.z=-Math.PI*.65,u.miniSunGroup.visible=!0,u.miniSunGroup.position.y=1.6+Math.sin(this.elapsed*4)*.12,u.miniSunGroup.rotation.y=this.elapsed*3):l.specialType===`ALIEN`&&(u.mysteryBoxGroup.visible=!0,u.lidOpenProgress=1,u.lidLeft.rotation.z=Math.PI*.65,u.lidRight.rotation.z=-Math.PI*.65):l.specialType===`NONE`?(u.mysteryBoxGroup.visible=!1,u.mineGroup.visible=!0,u.mineGroup.rotation.y=this.elapsed*2.4):(u.mysteryBoxGroup.visible=!0,u.lidOpenProgress=1,u.lidLeft.rotation.z=Math.PI*.65,u.lidRight.rotation.z=-Math.PI*.65,u.mineGroup.visible=!0,u.mineGroup.rotation.y=this.elapsed*2.4):t&&!i&&(u.lidLeft.rotation.z=Math.PI*.65,u.lidRight.rotation.z=-Math.PI*.65,u.mineGroup.visible=!0)}else if(c){u.badgeSprite.visible=!0;let e=r.currentRow===1,t=ve(r.currentMultiplier,r.minesCount,e),n=`${t.toFixed(2)}×`,i=f?`#fde047`:`#38bdf8`,a=!1;h===`orange`?(n=`SOLAR ${(Math.round(t*1.5*100)/100).toFixed(2)}×`,i=`#f59e0b`,a=!0):h===`alien`&&(n=`UFO WARP +2F`,i=`#c084fc`,a=!0);let o=`${s+1}|${n}|${i}|${f}`;u.lastBadgeSignature!==o&&(u.lastBadgeSignature=o,Kg(u.badgeCanvas,s+1,n,i,a,f),u.badgeTex.needsUpdate=!0),u.badgeSprite.scale.setScalar(f?1.14:1),u.badgeSprite.scale.x*=3.25,u.badgeSprite.scale.y*=1.32}}}}updateDeepSpaceEnvironment(e){let t=this.camera.position.z,n=this.ship.postHitStopBurstTimer>0,r=this.gameState.getAtmosphereTheme(),i=1+Math.max(0,r.tier)*.42,a=(n?2.6:1)*i,o=(n?115:34)*i;for(let n=0;n<__;n++){let r=this.starfieldPositions[n*3+2];r+=e*o,r>t+10?r-=260:r<t-260&&(r+=260),this.starfieldPositions[n*3+2]=r}this.starfieldGeo.attributes.position.needsUpdate=!0;for(let n of this.planets)n.sphereMesh.rotation.y+=n.rotSpeedY*e,n.surfaceMat.uniforms.uTime.value=this.elapsed,n.ringSystemGroup&&(n.ringSystemGroup.rotation.y-=n.rotSpeedY*.45*e),n.group.position.z+=n.driftSpeedZ*a*e,n.group.position.z>t+32?n.group.position.z-=320:n.group.position.z<t-300&&(n.group.position.z+=320);for(let n of this.distantSupernovas){n.age=(n.age+e)%n.cycleDuration;let r=n.age/n.cycleDuration,i=Math.sin(r*Math.PI);n.coreSprite.scale.setScalar(10+i*16),n.coreSprite.material.opacity=.35+i*.65;let o=1+r*18;n.shockRing.scale.setScalar(o),n.shockMat.opacity=(1-r)*.78,n.rayGroup.rotation.z+=e*.45,n.rayMat.opacity=i*.32,n.group.position.z+=6.5*a*e,n.group.position.z>t+25?n.group.position.z-=295:n.group.position.z<t-295&&(n.group.position.z+=295)}for(let r of this.shootingStars){if(r.age+=e,r.age>=r.maxAge||r.group.position.z>t+15){this.respawnShootingStar(r,this.ship.pos.z);continue}r.group.position.addScaledVector(r.vel,e*(n?1.5:1));let i=r.age/r.maxAge,a=Math.sin(i*Math.PI);r.tailMat.opacity=a*.88,r.headSprite.material.opacity=a}for(let n of this.asteroids)n.mesh.rotation.x+=n.rotSpeedX*e,n.mesh.rotation.y+=n.rotSpeedY*e,n.mesh.rotation.z+=n.rotSpeedZ*e,n.mesh.position.z+=n.driftSpeedZ*a*e,n.mesh.position.z>t+12?n.mesh.position.z-=220:n.mesh.position.z<t-220&&(n.mesh.position.z+=220);for(let n of this.nebulaClouds){n.sprite.position.y=n.baseY+Math.sin(this.elapsed*1.2+n.offsetZ)*1.2,n.sprite.position.x=n.baseX+Math.cos(this.elapsed*.65+n.offsetZ)*1.8,n.sprite.position.z+=n.driftSpeedZ*a*e;let r=(n.baseHue+this.elapsed*.018+Math.sin(n.offsetZ)*.06)%1;n.mat.color.setHSL(r,.72,.72),n.sprite.position.z>t+18?n.sprite.position.z-=245:n.sprite.position.z<t-245&&(n.sprite.position.z+=245)}let s=n?42:16;for(let n=0;n<m_;n++){let r=this.nebulaFlowPhases[n],i=this.nebulaFlowPositions[n*3],a=this.nebulaFlowPositions[n*3+1],o=this.nebulaFlowPositions[n*3+2];i+=Math.sin(this.elapsed*1.4+r+o*.03)*2.4*e,a+=Math.cos(this.elapsed*1.1+r+i*.04)*1.8*e,o+=s*e,o>t+12?o-=235:o<t-235&&(o+=235),this.nebulaFlowPositions[n*3]=i,this.nebulaFlowPositions[n*3+1]=a,this.nebulaFlowPositions[n*3+2]=o}this.nebulaFlowGeo.attributes.position.needsUpdate=!0;let c=-this.camVel.x*.38-this.mouseParallax.x*3.2,l=-this.camVel.y*.38+this.mouseParallax.y*2.4,u=(n?68:24)-this.camVel.z*.45;for(let n=0;n<h_;n++){let r=this.cosmicDustPositions[n*3]+c*e,i=this.cosmicDustPositions[n*3+1]+l*e,a=this.cosmicDustPositions[n*3+2]+u*e;r>24?r-=48:r<-24&&(r+=48),i>18?i-=32:i<-14&&(i+=32),a>t+6?a-=140:a<t-140&&(a+=140),this.cosmicDustPositions[n*3]=r,this.cosmicDustPositions[n*3+1]=i,this.cosmicDustPositions[n*3+2]=a}this.cosmicDustGeo.attributes.position.needsUpdate=!0}updateTrajectoryArc(t,n,r){let i=this.gameState.engine,a=n?this.gameState.hitStopLane:this.hoveredLane;if(!t||a===null){this.trajectoryLine.visible=!1;return}let o=this.scratchTrajStart.set(this.ship.pos.x,this.ship.pos.y+.2,this.ship.pos.z-2.2),s=this.scratchTrajEnd.set(e.laneToWorldX(a),1.1,e.rowToWorldZ(i.currentRow)),c=this.scratchTrajMid.set((o.x+s.x)*.5,Math.max(o.y,s.y)+2,(o.z+s.z)*.5),l=this.scratchTrajTmp;for(let e=0;e<=32;e++){let t=e/32,n=1-t;l.set(n*n*o.x+2*n*t*c.x+t*t*s.x,n*n*o.y+2*n*t*c.y+t*t*s.y,n*n*o.z+2*n*t*c.z+t*t*s.z),this.trajectoryPositions[e*3]=l.x,this.trajectoryPositions[e*3+1]=l.y,this.trajectoryPositions[e*3+2]=l.z}this.trajectoryLine.geometry.attributes.position.needsUpdate=!0,this.trajectoryMat.color.setHex(n?16638023:r),this.trajectoryLine.visible=!0}},T_={gameTitle:`Endless Descent`,studioName:`BySans Interactive`,balanceLabel:`Balance`,rgsConnected:`RGS Connected`,sandboxDemo:`Sandbox Demo`,connectionErrorTitle:`Connection Error`,connectionErrorDesc:`Unable to connect to the RGS server. Please verify your connection or launch parameters.`,reloadButton:`Reload Session`,betAmountLabel:`Bet Amount`,quickMin:`Min`,quickHalf:`½`,quickDouble:`2×`,quickMax:`Max`,minesCountLabel:`Mines Count`,minesProbLabel:`Odds`,powerupsLabel:`Premium Perks`,powerupsCostBadge:`+25% ea.`,warpPowerupTitle:`BOOST`,warpPowerupDesc:`Alien Jump & ×3`,shieldPowerupTitle:`SHIELD`,shieldPowerupDesc:`Absorbs 1 Mine`,focalActionLabel:`Primary Action`,focalActionReady:`Ready`,focalDropCapsule:`DROP POD`,focalCashout:`CASHOUT`,focalConnecting:`CONNECTING...`,focalInsufficientFunds:`Insufficient balance to place this bet.`,focalPartialCashoutBtn:`50% CASHOUT`,focalSecuredToast:`50% SECURED`,soundToggleTitle:`Toggle Audio Mute`,rulesToggleTitle:`Game Rules & Information`,fairnessToggleTitle:`Provably Fair Verification`,shortcutSpace:`Space`,shortcutKeyP:`Key P`,nextMultiplierLabel:`Next`,selectGatePrompt:`Select a gate [1–5] to descend`,touchGatePrompt:`Tap a gate [1–5]`,roundWonSub:`Cashout Credited`,roundCrashedSub:`Collision at Row`,readyToLaunchSub:`Configure your pod to launch`,rulesDialogTitle:`Game Rules`,rtpLabel:`Theoretical RTP`,maxWinLabel:`Maximum Win`,volatilityLabel:`Volatility`,volatilityValue:`Adjustable`,rulesUnderstandBtn:`Understood`,section1Title:`01 · Game Dynamics`,section1Body1:`Endless Descent is a high-speed vertical evasion and multiplier game. Each level presents 5 holographic gates hiding quantum hazard mines based on your chosen settings.`,section1Body2:`Passing through a safe gate exponentially increases the round multiplier. You can cash out your winnings at any point after clearing the first gate.`,section2Title:`02 · Mines Configuration & Odds`,tableThMines:`Mines`,tableThSafeGates:`Safe Gates`,tableThProb:`Probability`,tableThBaseMult:`Base Multiplier`,tableThRisk:`Profile`,riskLow:`Low Risk`,riskBalanced:`Balanced`,riskHigh:`High Volatility`,riskExtreme:`Extreme Risk`,section3Title:`03 · Tactical Modifiers`,modWarpTitle:`TURBO WARP`,modWarpCost:`+25% cost`,modWarpDesc:`Increases the frequency of Golden Gates (×2 or ×3 boosts) and activates Alien Mothership encounters that disintegrate hazard fields for the next 2 levels.`,modShieldTitle:`ENERGY SHIELD`,modShieldCost:`+25% cost`,modShieldDesc:`Deploys a forcefield that absorbs 1 fatal mine detonation, allowing the descent to continue to the next level without losing the round.`,section4Title:`04 · Cashout & 50% Partial Cashout`,cashoutTotalTitle:`Full Cashout (100%):`,cashoutTotalDesc:`Available from Row 1. Withdraws 100% of accumulated winnings to your balance and concludes the round in victory.`,cashoutPartialTitle:`Partial Cashout (50% Bankroll Lock):`,cashoutPartialDesc:`Available from Row 2. Secures 50% of current winnings directly into your safe balance while keeping the remaining 50% active on the pod to pursue higher multipliers. Usable once per level.`,winCapTitle:`Maximum Win Cap (10,000×):`,winCapDesc:`Upon reaching the maximum win cap of 10,000× bet, the round automatically concludes and credits full winnings.`,section5Title:`05 · Complete Controls & Shortcuts Guide`,controlsSectionTitle:`Interaction Guide`,ctrlPrimaryBtn:`Spacebar / Primary CTA: Drops the descent pod at round start, and cashes out accumulated winnings while active.`,ctrlPartialBtn:`Key P / 50% Button: Secures 50% of the accumulated prize directly into your bankroll.`,ctrlBetAdjust:`Bet Controls (Min, ½, 2×, Max): Steps through authorized RGS bet levels.`,ctrlMines:`Mine Selectors (1, 2, 3, 4): Configures the hazard mine density per gate.`,ctrlPowerups:`Modifier Keys (W for Turbo, E for Shield): Toggles special tactical perks.`,ctrlSound:`Audio Icon: Mutes or unmutes all music, ambient drone, and sound effects.`,ctrlFairness:`Fairness Shield: Displays the cryptographic seed modal for audit verification.`,ctrlRules:`Info Icon: Displays this comprehensive rulebook and paytable.`,section6Title:`06 · Verification & Legal Disclaimer`,disclaimerText:`Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.`,replayBadge:`REPLAY MODE`,replayPlayBtn:`PLAY REPLAY`,replayWatchAgainBtn:`WATCH AGAIN`,replayModeCostLabel:`Cost`,replayFinalMultiplierLabel:`Final Multiplier`,replayTotalWinLabel:`Total Win`,replayErrorTitle:`Replay Unavailable`,replayErrorDesc:`Could not fetch replay data for this event. Please check the URL or try again.`},E_={...T_,balanceLabel:`Coins`,betAmountLabel:`Play Amount`,focalActionLabel:`Action`,focalDropCapsule:`START PLAY`,focalCashout:`COLLECT`,focalInsufficientFunds:`Insufficient coins to make this play.`,focalPartialCashoutBtn:`50% COLLECT`,focalSecuredToast:`50% SECURED`,roundWonSub:`Win Credited`,rulesDialogTitle:`Game Rules & Win Table`,section2Title:`02 · Mines Configuration & Win Table`,section4Title:`04 · Collect & 50% Partial Collect`,cashoutTotalTitle:`Full Collect (100%):`,cashoutTotalDesc:`Available from Row 1. Collects 100% of accumulated wins into your coin balance and concludes the round.`,cashoutPartialTitle:`Partial Collect (50% Coin Lock):`,cashoutPartialDesc:`Available from Row 2. Secures 50% of current wins directly into your coin balance while keeping the remaining 50% active in the play.`,ctrlPrimaryBtn:`Spacebar / Primary CTA: Starts the play at round launch, and collects accumulated wins while active.`,ctrlPartialBtn:`Key P / 50% Button: Secures 50% of the accumulated prize into your coin balance.`,ctrlBetAdjust:`Play Controls (Min, ½, 2×, Max): Steps through authorized play levels.`,ctrlRules:`Info Icon: Displays this comprehensive rulebook and win table.`,replayModeCostLabel:`Play Cost`,disclaimerText:`Malfunction voids all plays and wins. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Wins are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.`},D_={gameTitle:`Endless Descent`,studioName:`BySans Interactive`,balanceLabel:`Saldo`,rgsConnected:`RGS Conectado`,sandboxDemo:`Modo Sandbox`,connectionErrorTitle:`Error de Conexión`,connectionErrorDesc:`No se pudo conectar con el servidor RGS. Verifica tu conexión o parámetros de sesión.`,reloadButton:`Recargar Sesión`,betAmountLabel:`Monto de Apuesta`,quickMin:`Mín`,quickHalf:`½`,quickDouble:`2×`,quickMax:`Máx`,minesCountLabel:`Cantidad de Minas`,minesProbLabel:`Prob.`,powerupsLabel:`Power-Ups Premium`,powerupsCostBadge:`+25% c/u`,warpPowerupTitle:`BOOST`,warpPowerupDesc:`Salto Alien & ×3`,shieldPowerupTitle:`ESCUDO`,shieldPowerupDesc:`Absorbe 1 Mina`,focalActionLabel:`Acción Principal`,focalActionReady:`Listo`,focalDropCapsule:`SOLTAR NAVE`,focalCashout:`COBRAR`,focalConnecting:`CONECTANDO...`,focalInsufficientFunds:`Saldo insuficiente para realizar esta apuesta.`,focalPartialCashoutBtn:`50% COBRO PARCIAL`,focalSecuredToast:`50% ASEGURADO`,soundToggleTitle:`Activar / Silenciar Sonido`,rulesToggleTitle:`Reglas del Juego e Información`,fairnessToggleTitle:`Verificación Provably Fair`,shortcutSpace:`Espacio`,shortcutKeyP:`Tecla P`,nextMultiplierLabel:`Siguiente`,selectGatePrompt:`Selecciona una compuerta [1–5] para descender`,touchGatePrompt:`Toca una compuerta [1–5]`,roundWonSub:`Cobro acreditado`,roundCrashedSub:`Impacto en nivel`,readyToLaunchSub:`Configura tu nave para despegar`,rulesDialogTitle:`Reglas de Juego`,rtpLabel:`RTP Teórico`,maxWinLabel:`Ganancia Máxima`,volatilityLabel:`Volatilidad`,volatilityValue:`Ajustable`,rulesUnderstandBtn:`Entendido`,section1Title:`01 · Dinámica de Juego`,section1Body1:`Endless Descent es un juego espacial de evasión de peligros y multiplicadores progresivos. Cada nivel presenta 5 compuertas holográficas donde se ocultan minas cuánticas según la configuración seleccionada.`,section1Body2:`Cruzar una compuerta segura incrementa exponencialmente el multiplicador de la ronda. Puedes retirar tus ganancias en cualquier momento a partir de la primera compuerta superada.`,section2Title:`02 · Configuración de Minas & Retornos`,tableThMines:`Minas`,tableThSafeGates:`Compuertas Seguras`,tableThProb:`Probabilidad`,tableThBaseMult:`Multiplicador Base`,tableThRisk:`Perfil`,riskLow:`Bajo riesgo`,riskBalanced:`Equilibrado`,riskHigh:`Alta volatilidad`,riskExtreme:`Riesgo extremo`,section3Title:`03 · Modificadores Tácticos`,modWarpTitle:`TURBO WARP`,modWarpCost:`+25% costo`,modWarpDesc:`Incrementa la probabilidad de Cartas Doradas (multiplicadores extra de ×2 o ×3) y activa el encuentro con la Nave Nodriza Alienígena, que desintegra los campos de minas de las 2 compuertas siguientes.`,modShieldTitle:`ESCUDO DEFLECTOR`,modShieldCost:`+25% costo`,modShieldDesc:`Genera una barrera que absorbe 1 detonación de mina fatal. Si la nave impacta un sector minado, el escudo disipa la explosión y permite continuar el descenso.`,section4Title:`04 · Retiros & Cobro Parcial (50%)`,cashoutTotalTitle:`Cobro Total (100%):`,cashoutTotalDesc:`Disponible desde la Fila 1. Retira el 100% del premio acumulado a tu balance y concluye la ronda con victoria.`,cashoutPartialTitle:`Cobro Parcial (50% Bankroll Lock):`,cashoutPartialDesc:`Disponible desde la Fila 2. Asegura el 50% de las ganancias acumuladas directamente en tu saldo seguro y mantiene el 50% restante activo en la nave para buscar mayores premios. Usable una vez por nivel.`,winCapTitle:`Límite de Ganancia (10,000×):`,winCapDesc:`Al alcanzar el multiplicador máximo de 10,000×, el sistema cierra automáticamente la ronda y acredita el pago íntegro.`,section5Title:`05 · Guía Completa de Controles y Atajos`,controlsSectionTitle:`Guía de Interacción`,ctrlPrimaryBtn:`Barra Espaciadora / Botón Principal: Lanza la cápsula al inicio de la ronda y cobra las ganancias acumuladas durante el descenso.`,ctrlPartialBtn:`Tecla P / Botón 50%: Bloquea y transfiere el 50% de las ganancias acumuladas a tu balance seguro.`,ctrlBetAdjust:`Botones de Ajuste (Mín, ½, 2×, Máx): Recorren los niveles de apuesta oficiales del RGS.`,ctrlMines:`Selectores de Minas (1, 2, 3, 4): Configuran la cantidad de minas por nivel de compuertas.`,ctrlPowerups:`Teclas W y E: Activan los potenciadores tácticos (Turbo Warp y Escudo Deflector).`,ctrlSound:`Icono de Audio: Silencia o reactiva la música ambiental, el zumbido de motor y los efectos de sonido.`,ctrlFairness:`Escudo de Verificación: Despliega el modal de semillas SHA-256 para auditoría criptográfica.`,ctrlRules:`Icono de Información: Despliega este manual de reglas y tabla de premios.`,section6Title:`06 · Verificación & Aviso Legal`,disclaimerText:`Cualquier fallo de funcionamiento anula todas las ganancias y partidas. Se requiere una conexión a internet estable. En caso de desconexión, reinicie el juego para completar las rondas inconclusas. El retorno esperado se calcula a lo largo de varias partidas. La pantalla del juego no representa ningún dispositivo físico y tiene fines meramente ilustrativos. Las ganancias se liquidan según la cantidad recibida del servidor remoto del juego y no según los eventos que ocurran en el navegador web. TM y © 2026 Engine.`,replayBadge:`MODO REPETICIÓN`,replayPlayBtn:`REPRODUCIR`,replayWatchAgainBtn:`VER DE NUEVO`,replayModeCostLabel:`Costo`,replayFinalMultiplierLabel:`Multiplicador Final`,replayTotalWinLabel:`Ganancia Total`,replayErrorTitle:`Repetición No Disponible`,replayErrorDesc:`No se pudo cargar la repetición del evento. Verifica la URL o intenta nuevamente.`},O_={...D_,balanceLabel:`Monedas`,betAmountLabel:`Monto de Juego`,focalActionLabel:`Acción`,focalDropCapsule:`INICIAR VUELO`,focalCashout:`RECOLECTAR`,focalInsufficientFunds:`Monedas insuficientes para realizar esta jugada.`,focalPartialCashoutBtn:`50% RECOLECTAR`,focalSecuredToast:`50% ASEGURADO`,roundWonSub:`Premio acreditado`,rulesDialogTitle:`Reglas de Juego y Tabla de Premios`,section2Title:`02 · Configuración de Minas & Tabla de Premios`,section4Title:`04 · Premios & Recolección Parcial (50%)`,cashoutTotalTitle:`Recolección Total (100%):`,cashoutTotalDesc:`Disponible desde la Fila 1. Asegura el 100% de las monedas acumuladas en tu balance y concluye la ronda.`,cashoutPartialTitle:`Recolección Parcial (50% Bloqueo):`,cashoutPartialDesc:`Disponible desde la Fila 2. Asegura el 50% de las monedas directamente en tu balance seguro mientras mantienes el 50% restante activo en la jugada.`,ctrlPrimaryBtn:`Barra Espaciadora / Botón Principal: Inicia el vuelo y recolecta monedas acumuladas durante el trayecto.`,ctrlPartialBtn:`Tecla P / Botón 50%: Asegura el 50% de las monedas ganadas directamente en tu balance.`,ctrlBetAdjust:`Botones de Ajuste (Mín, ½, 2×, Máx): Recorren los niveles de juego autorizados.`,ctrlRules:`Icono de Información: Despliega este manual de reglas y tabla de premios.`,replayModeCostLabel:`Costo de Jugada`,disclaimerText:`Cualquier fallo de funcionamiento anula todas las ganancias y partidas. Se requiere una conexión a internet estable. En caso de desconexión, reinicie el juego para completar las rondas inconclusas. El retorno esperado se calcula a lo largo de varias partidas. La pantalla del juego no representa ningún dispositivo físico y tiene fines meramente ilustrativos. Los premios se liquidan según la cantidad recibida del servidor remoto del juego y no según los eventos que ocurran en el navegador web. TM y © 2026 Engine.`};function k_(e,t){let n=(e||`en`).toLowerCase().trim();return n===`es`||n.startsWith(`es-`)?t?O_:D_:t?E_:T_}function A_(){let e=document.getElementById(`rules-modal-overlay`);return!!(e&&e.classList.contains(`active`))}function j_(){let e=document.getElementById(`rules-modal-overlay`);e&&(e.classList.remove(`active`),document.body.classList.remove(`rules-modal-open`))}function M_(){document.activeElement instanceof HTMLElement&&document.activeElement.blur(),N_();let e=document.getElementById(`rules-modal-overlay`);if(e){e.classList.add(`active`),document.body.classList.add(`rules-modal-open`);let t=e.querySelector(`.rules-modal-body`);t&&(t.scrollTop=0)}}function N_(){let e=document.getElementById(`rules-modal-overlay`);if(!e)return;let t=k_(G.session.language,G.session.isSocial);e.innerHTML=`
      <div class="rules-modal-backdrop" id="rules-backdrop"></div>
      <div class="rules-modal-window" id="rules-modal-window" role="dialog" aria-modal="true" aria-labelledby="rules-dialog-title">
        
        <!-- Header -->
        <div class="rules-modal-header">
          <div class="rules-modal-title-cluster">
            <h2 class="rules-modal-title" id="rules-dialog-title">${t.rulesDialogTitle}</h2>
            <span class="rules-modal-tag">${t.gameTitle} · ${t.studioName}</span>
          </div>
          <button class="rules-modal-close-btn" id="rules-close-btn" type="button" aria-label="Close Rules">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Metric Strip -->
        <div class="rules-metrics-strip">
          <div class="rules-metric-card">
            <span class="rules-metric-label">${t.rtpLabel}</span>
            <span class="rules-metric-value rtp">96.00%</span>
          </div>
          <div class="rules-metric-card">
            <span class="rules-metric-label">${t.maxWinLabel}</span>
            <span class="rules-metric-value maxwin">10,000×</span>
          </div>
          <div class="rules-metric-card">
            <span class="rules-metric-label">${t.volatilityLabel}</span>
            <span class="rules-metric-value volatility">${t.volatilityValue}</span>
          </div>
        </div>

        <!-- Scrollable Content Body -->
        <div class="rules-modal-body">
          
          <!-- Section 1: Dynamics -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section1Title}</h3>
            <p class="rules-text">${t.section1Body1}</p>
            <p class="rules-text">${t.section1Body2}</p>
          </div>

          <!-- Section 2: Odds & Multipliers Table -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section2Title}</h3>
            
            <!-- Desktop Table -->
            <div class="rules-table-container desktop-table-wrap">
              <table class="rules-table">
                <thead>
                  <tr>
                    <th>${t.tableThMines}</th>
                    <th>${t.tableThSafeGates}</th>
                    <th>${t.tableThProb}</th>
                    <th>${t.tableThBaseMult}</th>
                    <th>${t.tableThRisk}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="mine-pill">1 ${t.tableThMines.slice(0,-1)||`Mine`}</span></td>
                    <td>4 / 5</td>
                    <td class="num high">80.00%</td>
                    <td class="num gold">1.20×</td>
                    <td class="muted">${t.riskLow}</td>
                  </tr>
                  <tr>
                    <td><span class="mine-pill">2 ${t.tableThMines}</span></td>
                    <td>3 / 5</td>
                    <td class="num med">60.00%</td>
                    <td class="num gold">1.60×</td>
                    <td class="muted">${t.riskBalanced}</td>
                  </tr>
                  <tr>
                    <td><span class="mine-pill">3 ${t.tableThMines}</span></td>
                    <td>2 / 5</td>
                    <td class="num low">40.00%</td>
                    <td class="num gold">2.40×</td>
                    <td class="muted">${t.riskHigh}</td>
                  </tr>
                  <tr>
                    <td><span class="mine-pill">4 ${t.tableThMines}</span></td>
                    <td>1 / 5</td>
                    <td class="num ext">20.00%</td>
                    <td class="num gold">4.80×</td>
                    <td class="muted">${t.riskExtreme}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="rules-mobile-cards-wrap">
              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">1 ${t.tableThMines.slice(0,-1)||`Mine`}</span>
                  <span class="rules-mc-risk muted">${t.riskLow}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">4 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num high">80.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">1.20×</span>
                </div>
              </div>

              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">2 ${t.tableThMines}</span>
                  <span class="rules-mc-risk muted">${t.riskBalanced}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">3 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num med">60.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">1.60×</span>
                </div>
              </div>

              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">3 ${t.tableThMines}</span>
                  <span class="rules-mc-risk muted">${t.riskHigh}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">2 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num low">40.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">2.40×</span>
                </div>
              </div>

              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">4 ${t.tableThMines}</span>
                  <span class="rules-mc-risk muted">${t.riskExtreme}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">1 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num ext">20.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">4.80×</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Section 3: Cashout & Partial Cashout -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section4Title}</h3>
            <div class="rules-cashout-clean-box">
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge space">${t.shortcutSpace}</span>
                <div class="rules-ccb-info">
                  <strong>${t.cashoutTotalTitle}</strong> ${t.cashoutTotalDesc}
                </div>
              </div>
              <div class="rules-ccb-item highlight">
                <span class="rules-ccb-badge key-p">${t.shortcutKeyP}</span>
                <div class="rules-ccb-info">
                  <strong>${t.cashoutPartialTitle}</strong> ${t.cashoutPartialDesc}
                </div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge cap">10,000×</span>
                <div class="rules-ccb-info">
                  <strong>${t.winCapTitle}</strong> ${t.winCapDesc}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 5: Complete Controls Guide [235] -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section5Title}</h3>
            <div class="rules-cashout-clean-box">
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge space">${t.shortcutSpace}</span>
                <div class="rules-ccb-info">${t.ctrlPrimaryBtn}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge key-p">${t.shortcutKeyP}</span>
                <div class="rules-ccb-info">${t.ctrlPartialBtn}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">½ / 2×</span>
                <div class="rules-ccb-info">${t.ctrlBetAdjust}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">1 – 4</span>
                <div class="rules-ccb-info">${t.ctrlMines}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <div class="rules-ccb-info">${t.ctrlSound}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </span>
                <div class="rules-ccb-info">${t.ctrlFairness}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
                <div class="rules-ccb-info">${t.ctrlRules}</div>
              </div>
            </div>
          </div>

          <!-- Section 6: Official Legal Disclaimer [185] -->
          <div class="rules-section legal">
            <p class="rules-legal-text">${t.disclaimerText}</p>
          </div>

        </div>

        <!-- Footer -->
        <div class="rules-modal-footer">
          <button class="rules-modal-confirm-btn" id="rules-confirm-btn" type="button">
            ${t.rulesUnderstandBtn}
          </button>
        </div>

      </div>
    `;let n=document.getElementById(`rules-close-btn`),r=document.getElementById(`rules-confirm-btn`),i=document.getElementById(`rules-backdrop`),a=document.getElementById(`rules-modal-window`);n?.addEventListener(`click`,e=>{e.stopPropagation(),j_()}),r?.addEventListener(`click`,e=>{e.stopPropagation(),j_()}),i?.addEventListener(`click`,e=>{e.stopPropagation(),j_()}),a?.addEventListener(`click`,e=>{e.stopPropagation()})}function P_(e){let t=document.getElementById(`rules-modal-overlay`);t||(t=document.createElement(`div`),t.id=`rules-modal-overlay`,t.className=`rules-modal-overlay`,document.body.appendChild(t),N_(),window.addEventListener(`keydown`,e=>{e.key===`Escape`&&A_()&&(e.preventDefault(),j_())}))}var F_=5,I_=[`WARP ESCAPE SECURED`,`HYPER-JUMP CLEARED`,`ATMOSPHERIC BREACH COMPLETE`,`MAXIMUM EXTRACTION`,`ORBITAL TRAJECTORY ACHIEVED`],L_=[`ION_PLASMA`,`TITANIUM_SPARKS`,`QUANTUM_BURST`,`HYPERDRIVE_STREAKS`];function R_(e,t,n,r,i){let a=r.engine,o=G.session.isReplay,s=G.session.language,c=G.session.isSocial,l=k_(s,c),u=[...G.betConfig.betLevels].sort((e,t)=>e-t);function d(e){return G.session.currency===`JPY`?e.toFixed(0):e.toFixed(2)}function f(e){if(!u||u.length===0)return e;let t=u[0],n=Math.abs(e-t);for(let r of u){let i=Math.abs(e-r);i<n&&(n=i,t=r)}return t}if(e.innerHTML=`
      <div class="brand-cluster">
        <div class="brand-emblem" title="Endless Descent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L21 20L12 15.5L3 20L12 2Z" fill="#ffffff"/>
          </svg>
        </div>
        <div class="brand-titles">
          <span class="brand-name">${l.gameTitle}</span>
          <span class="brand-tag ${o?`replay`:`sandbox`}" id="brand-tag-indicator">
            <span class="${o?`rgs-pulse-dot`:`sandbox-dot`}"></span>
            ${l.studioName} · ${o?l.replayBadge:l.sandboxDemo}
          </span>
        </div>
      </div>

      <div class="header-ticker-strip" id="history-ticker">
        <span class="ticker-empty">${s===`es`?`Historial de multiplicadores`:`Multiplier History`}</span>
      </div>

      <div class="header-telemetry-cluster">
        <button class="icon-btn" id="btn-rules" type="button" title="${l.rulesToggleTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span id="rules-label">${s===`es`?`Reglas`:`Rules`}</span>
        </button>
        <button class="icon-btn active" id="btn-audio" type="button" title="${l.soundToggleTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="audio-icon-svg">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span id="audio-label">${s===`es`?`Sonido`:`Sound`}</span>
        </button>
        <div class="balance-pill" title="${l.balanceLabel}">
          <div>
            <div class="balance-label" id="balance-title-label">${o?l.replayBadge:l.balanceLabel}</div>
            <div class="balance-value" id="hud-balance">${G.formatCurrency(o&&G.session.replayParams?G.session.replayParams.amount:a.balance)}</div>
          </div>
        </div>
      </div>
    `,o){let e=G.session.replayParams||{game:`endless-descent`,version:`1.0`,mode:`base`,event:``,amount:1,currency:G.session.currency,language:s,social:c,device:`desktop`};t.innerHTML=`
          <div class="replay-dock-panel" id="replay-dock-panel">
            <div class="replay-telemetry">
              <span class="replay-tag-pill">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                ${l.replayBadge}
              </span>
              <div class="replay-metrics-row">
                <span class="replay-metric-item">${l.betAmountLabel}: <strong id="replay-base-bet">${G.formatCurrency(e.amount)}</strong></span>
                <span class="replay-metric-item">${l.replayFinalMultiplierLabel}: <strong id="replay-mult-val">0.00×</strong></span>
                <span class="replay-metric-item">${l.replayTotalWinLabel}: <strong id="replay-payout-val" style="color: #00e676;">${G.formatCurrency(0)}</strong></span>
              </div>
            </div>
            <button class="replay-btn-action" id="btn-replay-action" type="button">
              ${l.replayPlayBtn}
            </button>
          </div>
        `}else{let e=G.getCurrencySymbol(),n=G.betConfig.defaultBetLevel,r=n;t.innerHTML=`
          <div class="betting-panel-main-row">
            <!-- Column 1: Bet Amount Input & Quick Modifiers -->
            <div class="betting-field-group">
              <div class="betting-field-header">
                <span class="betting-field-label" id="bet-field-label">${l.betAmountLabel}</span>
                <span class="betting-field-meta" id="bet-pct-badge">Total: ${G.formatCurrency(r)}</span>
              </div>
              <div class="fintech-bet-input-box">
                <span class="fintech-currency-sign" id="fintech-curr-sign">${e}</span>
                <input type="number" inputmode="decimal" id="bet-input" value="${d(n)}" min="${G.betConfig.minBet}" max="${G.betConfig.maxBet}" step="${G.betConfig.stepBet}" aria-label="${l.betAmountLabel}" />
                <div class="fintech-quick-segments">
                  <button class="fintech-quick-pill" id="btn-min" type="button">${l.quickMin}</button>
                  <button class="fintech-quick-pill" id="btn-half" type="button">${l.quickHalf}</button>
                  <button class="fintech-quick-pill" id="btn-double" type="button">${l.quickDouble}</button>
                  <button class="fintech-quick-pill" id="btn-max" type="button">${l.quickMax}</button>
                </div>
              </div>
            </div>

            <!-- Column 2: Segmented Control for Mines / Hazards -->
            <div class="betting-field-group">
              <div class="betting-field-header">
                <span class="betting-field-label" id="mines-field-label">${l.minesCountLabel}</span>
                <span class="betting-field-meta" id="survival-odds-badge">80% ${l.minesProbLabel} · 1.20×</span>
              </div>
              <div class="fintech-segmented-track" id="mine-selector" role="radiogroup" aria-label="${l.minesCountLabel}">
                <button class="fintech-segment-btn active" data-mines="1" type="button">
                  <span class="segment-main-num">1</span>
                  <span class="segment-sub-odds">80%</span>
                </button>
                <button class="fintech-segment-btn" data-mines="2" type="button">
                  <span class="segment-main-num">2</span>
                  <span class="segment-sub-odds">60%</span>
                </button>
                <button class="fintech-segment-btn" data-mines="3" type="button">
                  <span class="segment-main-num">3</span>
                  <span class="segment-sub-odds">40%</span>
                </button>
                <button class="fintech-segment-btn" data-mines="4" type="button">
                  <span class="segment-main-num">4</span>
                  <span class="segment-sub-odds">20%</span>
                </button>
              </div>
            </div>

            <!-- Column 3: Primary Visual Focal Point — Action Button & Partial Cashout -->
            <div class="betting-field-group fintech-cta-wrap">
              <div class="betting-field-header">
                <span class="betting-field-label" id="focal-cta-header-label">${l.focalActionLabel}</span>
                <span class="betting-field-meta" id="focal-cta-header-shortcut">${l.shortcutSpace}</span>
              </div>
              <div class="focal-cta-actions-cluster">
                <button class="btn-primary-focal" id="btn-primary-cta" type="button">
                  <span class="focal-btn-headline" id="focal-cta-title">${l.focalDropCapsule}</span>
                  <span class="focal-btn-sub" id="focal-cta-sub">${G.formatCurrency(r)} · ${l.focalActionReady}</span>
                </button>
                <button class="btn-partial-focal" id="btn-partial-cta" type="button" style="display: none;">
                  <div class="partial-btn-left">
                    <span class="partial-btn-headline">${l.focalPartialCashoutBtn}</span>
                    <span class="partial-btn-sub" id="partial-cta-sub">+${G.formatCurrency(0)}</span>
                  </div>
                  <span class="partial-pill-badge">${l.shortcutKeyP}</span>
                </button>
              </div>
            </div>
          </div>
        `}let p=document.createElement(`div`);p.className=`stage-hud-overlay`,p.innerHTML=`
      <div class="stage-top-hud-stack">
        <div class="multiplier-hero-banner" id="mult-hero-wrap">
          <div class="multiplier-God-value" id="mult-hero-value">1.00×</div>
          <div class="multiplier-sub-pill">
            <span class="mult-sub-status" id="mult-hero-sub">${l.readyToLaunchSub}</span>
            <span class="mult-next-tag" id="mult-next-preview">${l.nextMultiplierLabel}: 1.20×</span>
          </div>
        </div>

        <div class="hitstop-callout-pill" id="hitstop-comic-stamp">1.20×</div>
      </div>
      <div></div>
    `,n.appendChild(p);let m=document.createElement(`div`);m.className=`try-again-overlay`,m.id=`try-again-overlay`,m.innerHTML=`
      <canvas class="try-again-particles-canvas" id="try-again-particles-canvas"></canvas>
      <div class="try-again-content" id="try-again-content">
        <div class="try-again-headline">HULL BREACH DETECTED</div>
        <div class="try-again-sub">${s===`es`?`PURGA DE SISTEMA · REINICIANDO NAVE...`:`SYSTEM PURGE · RE-ENGAGING PROPULSION...`}</div>
      </div>
    `,n.appendChild(m);let h=document.createElement(`div`);h.className=`mega-win-overlay`,h.id=`mega-win-banner`,h.innerHTML=`
      <canvas class="victory-particles-canvas" id="victory-particles-canvas"></canvas>
      <div class="supernova-god-rays"></div>
      <div class="supernova-anamorphic-flare" id="supernova-flare-bar"></div>
      <div class="mega-win-card" id="mega-win-card-inner">
        <div class="mega-win-headline" id="mega-win-title">IS YOUR LUCKY DAY, TRY AGAIN</div>
        <div class="mega-win-payout" id="mega-win-amount">+${G.formatCurrency(0)}</div>
        <div class="mega-win-mult" id="mega-win-mult">1.00× Multiplier</div>
      </div>
    `,n.appendChild(h),a.minesCount=1;let g=document.getElementById(`hud-balance`),_=document.getElementById(`history-ticker`),v=document.getElementById(`mult-hero-wrap`),y=document.getElementById(`mult-hero-value`),b=document.getElementById(`mult-hero-sub`),x=document.getElementById(`mult-next-preview`),S=document.getElementById(`hitstop-comic-stamp`),C=document.getElementById(`bet-input`),w=document.getElementById(`bet-pct-badge`),T=document.getElementById(`survival-odds-badge`),E=t.querySelectorAll(`#mine-selector .fintech-segment-btn`),D=t.querySelectorAll(`.fintech-quick-pill`),O=document.getElementById(`btn-primary-cta`),k=document.getElementById(`focal-cta-title`),A=document.getElementById(`focal-cta-sub`),j=document.getElementById(`focal-cta-header-label`),M=document.getElementById(`focal-cta-header-shortcut`),N=document.getElementById(`btn-partial-cta`),P=document.getElementById(`partial-cta-sub`),F=document.getElementById(`btn-audio`),I=document.getElementById(`btn-rules`);P_(),I&&I.addEventListener(`click`,()=>{xe.playClick(),M_()}),typeof window<`u`&&new URLSearchParams(window.location.search).get(`rules`)===`true`&&M_(),F&&F.addEventListener(`click`,()=>{let e=xe.toggleMute();F.classList.toggle(`active`,!e);let t=document.getElementById(`audio-icon-svg`);t&&(t.innerHTML=e?`<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`:`<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`)});let L=document.getElementById(`try-again-content`),ee=document.getElementById(`try-again-particles-canvas`),te=document.getElementById(`mega-win-title`),ne=document.getElementById(`mega-win-amount`),R=document.getElementById(`mega-win-mult`),re=document.getElementById(`mega-win-card-inner`),z=document.getElementById(`supernova-flare-bar`),ie=document.getElementById(`victory-particles-canvas`),ae=null,oe=null,B=null,se=null,ce={val:0},le=0,ue=-1,de=-1;if(o||G.authenticate().then(e=>{if(e.isConnectionError){let t=document.createElement(`div`);t.className=`rgs-connection-blocker`,t.innerHTML=`
                  <div class="rgs-error-card">
                    <div class="rgs-error-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <h2 class="rgs-error-title">${l.connectionErrorTitle}</h2>
                    <p class="rgs-error-desc">${e.errorMessage||l.connectionErrorDesc}</p>
                    <button class="rgs-reload-btn" type="button" id="btn-rgs-reload">${l.reloadButton}</button>
                  </div>
                `,document.body.appendChild(t),document.getElementById(`btn-rgs-reload`)?.addEventListener(`click`,()=>{window.location.reload()});return}e.config&&e.config.betLevels&&e.config.betLevels.length>0&&(u=[...e.config.betLevels].sort((e,t)=>e-t));let t=document.getElementById(`brand-tag-indicator`);t&&(G.session.isLiveRGS&&e.success?(a.balance=e.balance,t.className=`brand-tag live-rgs`,t.innerHTML=`<span class="rgs-pulse-dot"></span> ${l.studioName} · ${l.rgsConnected} (${G.session.currency})`):(t.className=`brand-tag sandbox`,t.innerHTML=`<span class="sandbox-dot"></span> ${l.studioName} · ${l.sandboxDemo}`));let n=document.getElementById(`fintech-curr-sign`);if(n&&(n.textContent=G.getCurrencySymbol()),C){if(C.min=String(e.config.minBet),C.max=String(e.config.maxBet),C.step=String(e.config.stepBet),e.activeRound&&e.activeRound.active){let t=e.activeRound.amount;C.value=d(t),a.betAmount=t,a.activeBetAmount=t,a.initialEffectiveBet=t;let n=typeof e.activeRound.payoutMultiplier==`number`&&e.activeRound.payoutMultiplier>0?e.activeRound.payoutMultiplier:1;a.currentMultiplier=n,a.state=U.PLAYING,a.currentRow=n>1?2:1,G.showToast(s===`es`?`Ronda activa reanudada.`:`Active round resumed.`,`info`,3e3)}else C.value=d(e.config.defaultBetLevel),a.betAmount=e.config.defaultBetLevel}ge(),De()}),o){let e=G.session.replayParams,t=document.getElementById(`btn-replay-action`),n=!1;G.fetchReplayEvent().then(i=>{if(!i.success){G.showToast(i.errorMessage||l.replayErrorDesc,`error`);return}let o=i.costMultiplier??1,s=i.payoutMultiplier??0,c=e?e.amount:1,u=c*o,d=c*s,f=document.getElementById(`replay-base-bet`),p=document.getElementById(`replay-total-cost`),m=document.getElementById(`replay-mult-val`),h=document.getElementById(`replay-payout-val`);f&&(f.textContent=G.formatCurrency(c)),p&&(p.textContent=G.formatCurrency(u)),m&&(m.textContent=`${s.toFixed(2)}×`),h&&(h.textContent=G.formatCurrency(d)),t&&t.addEventListener(`click`,async()=>{if(n)return;n=!0,t.disabled=!0,t.textContent=`...`,a.resetToIdle(),fe(),pe(),xe.playClick(),xe.startAmbientDrone(),a.startBet(c,1,!1,!1),De();let e=Math.max(1,Math.min(10,Math.round(s>0?s/1.2:2)));for(let t=1;t<=e;t++){if(await new Promise(e=>setTimeout(e,700)),t===e&&s===0){a.cashout(),a.state=U.CRASHED,me();break}r.selectLaneWithHitStop(Math.floor(Math.random()*F_))}s>0&&(await new Promise(e=>setTimeout(e,400)),a.cashout(),s>=5&&Ae(d,s)),n=!1,t.disabled=!1,t.textContent=l.replayWatchAgainBtn,De()})})}function fe(){ae!==null&&(window.clearTimeout(ae),ae=null),oe!==null&&(cancelAnimationFrame(oe),oe=null);let e=ee.getContext(`2d`);e&&(e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,ee.width,ee.height)),Sg.killTweensOf(L),m.classList.remove(`visible`)}function pe(){B!==null&&(window.clearTimeout(B),B=null),se!==null&&(cancelAnimationFrame(se),se=null);let e=ie.getContext(`2d`);e&&(e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,ie.width,ie.height)),Sg.killTweensOf(ce),Sg.killTweensOf(re),Sg.killTweensOf(z),Sg.killTweensOf(R),h.classList.remove(`visible`)}function me(){fe();let e=Math.min(n.clientWidth||window.innerWidth,1600),t=Math.min(n.clientHeight||window.innerHeight,1e3);ee.width=e,ee.height=t;let r=ee.getContext(`2d`,{alpha:!0}),i=e*.5,o=t*.46,s=[`#ff2a54`,`#fb7185`,`#fbbf24`,`#ffffff`,`#00e5ff`],c=[];for(let e=0;e<56;e++){let t=Math.random()*Math.PI*2,n=160+Math.random()*540;c.push({x:i+(Math.random()-.5)*70,y:o+(Math.random()-.5)*30,vx:Math.cos(t)*n,vy:Math.sin(t)*n-60,size:3+Math.random()*5,alpha:1,decay:.78+Math.random()*.5,color:s[e%s.length]})}let l=20,u=performance.now();m.classList.add(`visible`),Sg.fromTo(L,{scale:.35,opacity:0,y:18},{scale:1,opacity:1,y:0,duration:.32,ease:`back.out(2.0)`});let d=n=>{let a=Math.min(.05,(n-u)/1e3);if(u=n,r){r.clearRect(0,0,e,t),l+=a*620,r.save(),r.strokeStyle=`rgba(255, 42, 84, 0.4)`,r.lineWidth=3,r.beginPath(),r.arc(i,o,l,0,Math.PI*2),r.stroke(),r.restore();for(let e=0;e<c.length;e++){let t=c[e];t.x+=t.vx*a,t.y+=t.vy*a,t.vy+=420*a,t.alpha-=t.decay*a,t.alpha>0&&(r.fillStyle=t.color,r.globalAlpha=t.alpha,r.fillRect(t.x-t.size*.5,t.y-t.size*.5,t.size,t.size))}r.globalAlpha=1}oe=requestAnimationFrame(d)};oe=requestAnimationFrame(d),ae=window.setTimeout(()=>{Sg.to(L,{opacity:0,scale:.85,duration:.2,ease:`power2.in`,onComplete:()=>{fe(),a.resetToIdle(),De()}})},1250)}function he(){if(!C)return;let e=C.value.length;e<=6?C.style.fontSize=`1.15rem`:e<=9?C.style.fontSize=`0.98rem`:e<=12?C.style.fontSize=`0.84rem`:C.style.fontSize=`0.74rem`}function ge(){if(!C||o)return;he();let e=Math.max(G.betConfig.minBet,parseFloat(C.value)||G.betConfig.defaultBetLevel);a.betAmount=e;let t=ye(e),n=G.formatCurrency(t);w&&(w.textContent=`Total: ${n}`),A&&a.state!==U.PLAYING&&(A.textContent=`${n} · ${l.focalActionReady}`)}C&&(C.addEventListener(`input`,()=>{A_()||ge()}),C.addEventListener(`blur`,()=>{if(A_())return;let e=f(parseFloat(C.value)||u[0]);C.value=d(e),ge()}));let _e=document.getElementById(`btn-min`);_e&&_e.addEventListener(`click`,()=>{!A_()&&a.state!==U.PLAYING&&C&&(xe.playClick(),C.value=d(u[0]),ge())});let W=document.getElementById(`btn-half`);W&&W.addEventListener(`click`,()=>{if(A_()||a.state===U.PLAYING||!C)return;xe.playClick();let e=parseFloat(C.value)||u[0],t=u.findIndex(t=>t>=e),n=t>0?t-1:0;C.value=d(u[n]),ge()});let be=document.getElementById(`btn-double`);be&&be.addEventListener(`click`,()=>{if(A_()||a.state===U.PLAYING||!C)return;xe.playClick();let e=parseFloat(C.value)||u[0],t=u.findIndex(t=>t>=e),n=t<u.length-1?t+1:u.length-1;C.value=d(u[n]),ge()});let Se=document.getElementById(`btn-max`);Se&&Se.addEventListener(`click`,()=>{if(A_()||a.state===U.PLAYING||!C)return;xe.playClick();let e=u.filter(e=>e<=a.balance),t=e.length>0?e[e.length-1]:u[u.length-1];C.value=d(t),ge()}),E.forEach(e=>{e.addEventListener(`click`,()=>{if(A_()||a.state===U.PLAYING)return;xe.playClick();let t=parseInt(e.dataset.mines||`1`,10);a.minesCount=t,E.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),De()})});function Ce(){O&&(O.classList.add(`depressed-heavy`),setTimeout(()=>{O.classList.remove(`depressed-heavy`)},180))}async function we(){if(!(A_()||o)){if(a.state===U.PLAYING){if(a.currentRow>1&&!r.isHitStopActive){Ce();let e=a.cashout();if(De(),G.session.isLiveRGS&&e!==null&&e>0){let e=await G.endRound();e.success&&e.balance!==void 0&&(a.balance=e.balance,a.emitBalanceChange())}}}else{fe(),pe(),Ce();let e=f(C&&parseFloat(C.value)||u[0]);C&&(C.value=d(e));let t=ye(e);if(a.balance<t){G.showToast(l.focalInsufficientFunds,`error`);return}if(xe.playClick(),xe.startAmbientDrone(),G.session.isLiveRGS){O&&(O.disabled=!0),k&&(k.textContent=l.focalConnecting);let e=await G.playBet(t,`base`);if(O&&(O.disabled=!1),!e.success){De();return}e.balance!==void 0&&(a.balance=e.balance+t)}a.startBet(e,a.minesCount)&&(Sg.fromTo(v,{scale:.92},{scale:1,duration:.35,ease:`back.out(1.8)`}),De())}}}async function Te(){if(A_()||o||!a.canPartialCashout()||r.isHitStopActive)return;xe.playClick();let e=a.partialCashout();e!==null&&e>0&&(xe.playPartialCashout(),Sg.killTweensOf(S),S.textContent=`[50% SECURED] ${l.focalSecuredToast.toUpperCase()} · +${G.formatCurrency(e)}`,S.style.borderColor=`#38bdf8`,S.style.color=`#38bdf8`,Sg.fromTo(S,{opacity:0,scale:.88,y:-4},{opacity:1,scale:1.05,y:0,duration:.16,ease:`back.out(1.8)`}),Sg.to(S,{opacity:0,scale:.94,delay:.85,duration:.22,ease:`power2.out`}),N&&(N.classList.add(`partial-depressed`),setTimeout(()=>{N.classList.remove(`partial-depressed`)},180)),De())}O&&O.addEventListener(`click`,we),N&&N.addEventListener(`click`,Te),window.addEventListener(`keydown`,e=>{if(!A_()&&!(C&&document.activeElement===C)){if(e.key>=`1`&&e.key<=`5`){let t=parseInt(e.key,10)-1;a.state===U.PLAYING&&!r.isHitStopActive&&(e.preventDefault(),r.selectLaneWithHitStop(t))}else e.key.toLowerCase()===`p`?(e.preventDefault(),Te()):e.code===`Space`&&(e.preventDefault(),we())}});function Ee(){let e=a.recentSummaries.slice(0,8);e.length!==0&&(_.innerHTML=e.map(e=>{let t=e.isWin?e.finalMultiplier>=5?`mega`:`win`:`loss`,n=e.isWin?`${e.finalMultiplier.toFixed(2)}×`:`0.00×`,r=G.formatCurrency(e.effectiveBet);return`<span class="ticker-badge ${t}" title="${s===`es`?`Ronda`:`Round`} #${e.nonce} · ${l.betAmountLabel}: ${r}">${n}</span>`}).join(``))}function De(){let e=a.state===U.PLAYING,t=a.currentMultiplier,n=a.currentPicks.length===0,i=e?ve(t,a.minesCount,n):V(1,a.minesCount),c=window.innerWidth<=768,d=document.getElementById(`balance-title-label`);d&&(d.textContent=o?l.replayBadge:l.balanceLabel);let f=Math.round((F_-a.minesCount)/F_*100),p=V(1,a.minesCount);if(T&&(T.textContent=c?`${f}% · ${p.toFixed(2)}×`:`${f}% ${l.minesProbLabel} · ${p.toFixed(2)}×`),g&&!o&&(g.textContent=G.formatCurrency(a.balance)),y.textContent=`${t.toFixed(2)}×`,x.textContent=`${l.nextMultiplierLabel}: ${i.toFixed(2)}×`,e){let e=H(a.activeBetAmount,t);b.textContent=a.currentRow>1?`${l.roundWonSub}: ${G.formatCurrency(e)}`:c?l.touchGatePrompt:l.selectGatePrompt}else if(a.state===U.WON){let e=a.recentSummaries[0]?.payout??0;b.textContent=`${l.roundWonSub}: +${G.formatCurrency(e)}`}else a.state===U.CRASHED?b.textContent=`${l.roundCrashedSub} ${a.lastCrashedRow??1}`:b.textContent=l.readyToLaunchSub;if(C&&(C.disabled=e),D.forEach(t=>t.disabled=e),E.forEach(t=>t.disabled=e),C&&w&&!o){he();let n=ye(Math.max(G.betConfig.minBet,parseFloat(C.value)||u[0])),o=G.formatCurrency(n);w.textContent=`Total: ${o}`;let c=e&&a.currentRow>1&&!r.isHitStopActive;if(O&&j&&k&&A){if(!e)O.disabled=!1,O.classList.remove(`mode-cashout`),j.textContent=l.focalActionLabel,k.textContent=l.focalDropCapsule,A.textContent=`${o} · ${l.focalActionReady}`;else if(c){let e=H(a.activeBetAmount,t);O.disabled=!1,O.classList.add(`mode-cashout`),j.textContent=s===`es`?`Cobro Disponible`:`Cashout Available`,k.textContent=`${l.focalCashout} ${G.formatCurrency(e)}`,A.textContent=`${t.toFixed(2)}× · ${l.shortcutSpace}`}else O.disabled=!0,O.classList.remove(`mode-cashout`),j.textContent=s===`es`?`Ronda en Curso`:`Round Active`,k.textContent=`[1–5]`,A.textContent=`Row ${a.currentRow} · ${i.toFixed(2)}×`}let d=a.canPartialCashout()&&!r.isHitStopActive;if(N&&P&&M){if(d){N.style.display=`flex`,N.disabled=!1;let e=Math.floor(H(a.activeBetAmount,t)*.5*100)/100;P.textContent=`+${G.formatCurrency(e)}`,M.textContent=`${l.shortcutSpace} / ${l.shortcutKeyP}`}else N.style.display=`none`,N.disabled=!0,M.textContent=l.shortcutSpace}}Ee()}r.onHitStopStart((e,t,n,r)=>{De(),Sg.killTweensOf(S),S.textContent=r,S.style.borderColor=`rgba(0, 229, 255, 0.45)`,S.style.color=`#ffffff`,Sg.fromTo(S,{opacity:0,scale:.88,y:-4},{opacity:1,scale:1.05,y:0,duration:.12,ease:`back.out(1.8)`})}),r.onHitStopResolve(e=>{if(De(),e.isSafe){let t=H(a.activeBetAmount,e.stepMultiplierAfter);Sg.killTweensOf(S),S.textContent=`ROW ${e.row} CLEARED · +${G.formatCurrency(t)}`,S.style.borderColor=`#00e676`,S.style.color=`#00e676`,Sg.fromTo(S,{opacity:1,scale:1.04,y:0},{opacity:0,scale:.96,y:-3,delay:.55,duration:.22,ease:`power2.out`}),Sg.killTweensOf(y),Sg.killTweensOf(v),Sg.fromTo(y,{scale:1.12,color:`#00e676`},{scale:1,color:`#ffffff`,duration:.48,ease:`elastic.out(1.4, 0.3)`}),Sg.fromTo(v,{scale:1.04},{scale:1,duration:.48,ease:`elastic.out(1.35, 0.32)`})}else Sg.killTweensOf(S),Sg.to(S,{opacity:0,scale:.92,duration:.12}),Sg.fromTo(v,{x:-18},{x:0,duration:.45,ease:`elastic.out(1.5, 0.25)`}),me()}),a.onCashout(()=>{a.resetToIdle(),t.classList.remove(`betting-dock-ready-pulse`),t.offsetWidth,t.classList.add(`betting-dock-ready-pulse`),De()}),r.onMegaWin((e,t)=>{Ae(e,t)}),a.onBalanceChange(()=>{De()});let Oe=new Map;function ke(e,t,n,r){let i=`${e}|${t}|${n}|${r}`,a=Oe.get(i);if(a)return a;let o=document.createElement(`canvas`);o.width=64,o.height=64;let s=o.getContext(`2d`);if(s.translate(32,32),e===`ION_PLASMA`){let e=s.createRadialGradient(0,0,1,0,0,16);e.addColorStop(0,`#ffffff`),e.addColorStop(.35,t),e.addColorStop(1,`rgba(0, 240, 255, 0)`),s.fillStyle=e,s.shadowColor=`#00f0ff`,s.shadowBlur=8,s.beginPath(),s.arc(0,0,16,0,Math.PI*2),s.fill(),s.shadowBlur=0,s.strokeStyle=n,s.lineWidth=1.8,s.beginPath(),s.arc(0,0,9.6,0,Math.PI*2),s.stroke()}else if(e===`TITANIUM_SPARKS`)s.fillStyle=t,s.shadowColor=`#f59e0b`,s.shadowBlur=8,s.beginPath(),s.moveTo(0,-16),s.lineTo(7.2,0),s.lineTo(0,16),s.lineTo(-7.2,0),s.closePath(),s.fill(),s.shadowBlur=0,s.fillStyle=`#ffffff`,s.fillRect(-2,-2,4,4);else if(e===`QUANTUM_BURST`){s.fillStyle=t,s.shadowColor=`#c084fc`,s.shadowBlur=8,s.beginPath();for(let e=0;e<6;e++){let t=e*Math.PI/3,n=Math.cos(t)*17,r=Math.sin(t)*17;e===0?s.moveTo(n,r):s.lineTo(n,r)}s.closePath(),s.fill(),s.shadowBlur=0,s.strokeStyle=`#ffffff`,s.lineWidth=1.6,s.stroke()}else s.fillStyle=t,s.shadowColor=t,s.shadowBlur=8,s.beginPath(),s.ellipse(0,0,22,4,0,0,Math.PI*2),s.fill(),s.shadowBlur=0,s.fillStyle=`#ffffff`,s.fillRect(-11,-1,22,2);return Oe.set(i,o),o}function Ae(e,r){pe();let i=0,o=0;if(le===0||le%4==0)i=0,o=0;else{do i=Math.floor(Math.random()*I_.length);while(i===ue);do o=Math.floor(Math.random()*L_.length);while(o===de)}le++,ue=i,de=o;let c=I_[i],l=L_[o];te.textContent=c,R.textContent=`${r.toFixed(2)}× ${s===`es`?`MULTIPLICADOR`:`MULTIPLIER`}`,l===`ION_PLASMA`?(te.style.background=`linear-gradient(180deg, #ffffff 0%, #38bdf8 48%, #00f0ff 100%)`,te.style.webkitBackgroundClip=`text`,te.style.webkitTextFillColor=`transparent`):l===`TITANIUM_SPARKS`?(te.style.background=`linear-gradient(180deg, #ffffff 0%, #fde047 48%, #f59e0b 100%)`,te.style.webkitBackgroundClip=`text`,te.style.webkitTextFillColor=`transparent`):l===`QUANTUM_BURST`?(te.style.background=`linear-gradient(180deg, #ffffff 0%, #e9d5ff 48%, #a855f7 100%)`,te.style.webkitBackgroundClip=`text`,te.style.webkitTextFillColor=`transparent`):(te.style.background=`linear-gradient(180deg, #ffffff 0%, #bae6fd 48%, #818cf8 100%)`,te.style.webkitBackgroundClip=`text`,te.style.webkitTextFillColor=`transparent`);let u=Math.min(n.clientWidth||window.innerWidth,1600),d=Math.min(n.clientHeight||window.innerHeight,1e3);ie.width=u,ie.height=d;let f=ie.getContext(`2d`,{alpha:!0}),p={ION_PLASMA:[`#00f0ff`,`#38bdf8`,`#0284c7`,`#ffffff`],TITANIUM_SPARKS:[`#fde047`,`#f59e0b`,`#fb923c`,`#ffffff`],QUANTUM_BURST:[`#c084fc`,`#a855f7`,`#7c3aed`,`#e9d5ff`],HYPERDRIVE_STREAKS:[`#ffffff`,`#38bdf8`,`#818cf8`,`#00f0ff`]}[l],m=l===`TITANIUM_SPARKS`?`#f59e0b`:`#38bdf8`,g=[];for(let e=0;e<68;e++){let t=l===`HYPERDRIVE_STREAKS`&&e<34,n=Math.random()*Math.PI*2,r=180+Math.random()*500,i=p[e%p.length],a=e%3==0?4:3;g.push({x:t?u*.5+(Math.random()-.5)*110:Math.random()*u,y:t?d*.42+(Math.random()-.5)*70:-20-Math.random()*d*.85,vx:t?Math.cos(n)*r:(Math.random()-.5)*130,vy:t?Math.sin(n)*r-110:250+Math.random()*390,size:16+Math.random()*16,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*5,spinPhase:Math.random()*Math.PI*2,spinSpeed:3.2+Math.random()*5.2,alpha:.88+Math.random()*.12,color:i,secondaryColor:m,leafCount:a,sprite:ke(l,i,m,a)})}h.classList.add(`visible`),Sg.fromTo(re,{scale:.45,opacity:0,y:24},{scale:1,opacity:1,y:0,duration:.42,ease:`back.out(1.8)`}),Sg.fromTo(z,{scaleX:.1,opacity:1},{scaleX:1.15,opacity:.82,duration:.48,ease:`expo.out`}),Sg.fromTo(R,{scale:.45},{scale:1,duration:.58,ease:`back.out(2.0)`}),ce={val:0},Sg.to(ce,{val:e,duration:.7,ease:`power3.out`,onUpdate:()=>{ne.textContent=`+${G.formatCurrency(ce.val)}`}});let _=performance.now(),v=e=>{let t=Math.min(.05,(e-_)/1e3);if(_=e,f){f.setTransform(1,0,0,1,0,0),f.clearRect(0,0,u,d);for(let n=0;n<g.length;n++){let r=g[n];r.x+=r.vx*t+Math.sin(e*.004+r.spinPhase)*32*t,r.y+=r.vy*t,r.vy+=180*t,r.rot+=r.rotSpeed*t,r.spinPhase+=r.spinSpeed*t,r.y>d+30&&(r.y=-25,r.x=Math.random()*u,r.vy=240+Math.random()*360);let i=l===`HYPERDRIVE_STREAKS`?1:Math.max(.24,Math.abs(Math.cos(r.spinPhase))),a=Math.cos(r.rot),o=Math.sin(r.rot),s=r.size*1.9,c=s*.5;f.globalAlpha=r.alpha,f.setTransform(a*i,o*i,-o,a,r.x,r.y),f.drawImage(r.sprite,-c,-c,s,s)}f.setTransform(1,0,0,1,0,0),f.globalAlpha=1}se=requestAnimationFrame(v)};se=requestAnimationFrame(v),B=window.setTimeout(()=>{Sg.to(re,{scale:.9,opacity:0,duration:.16,ease:`power2.in`,onComplete:()=>{pe(),a.state!==U.PLAYING&&(a.resetToIdle(),t.classList.remove(`betting-dock-ready-pulse`),t.offsetWidth,t.classList.add(`betting-dock-ready-pulse`),De())}})},1320)}window.addEventListener(`resize`,()=>{De()}),ge(),De()}document.querySelector(`#app`).innerHTML=`
  <div class="pc-command-shell" id="pc-command-shell">
    <header class="pc-top-header" id="pc-top-header"></header>

    <main class="pc-cockpit-grid">
      <aside class="pc-left-dock" id="left-command-dock"></aside>

      <section class="pc-center-stage" id="stage-container">
        <canvas id="game-canvas"></canvas>
      </section>
    </main>
  </div>
`;var z_=document.getElementById(`pc-top-header`),B_=document.getElementById(`left-command-dock`),V_=document.getElementById(`stage-container`),H_=document.getElementById(`game-canvas`),U_=new be(fe(),`stake_production_player_1`),W_=new we(U_),G_=new w_(H_,W_);R_(z_,B_,V_,W_,G_),requestAnimationFrame(()=>{G_.setupDPI(!0)}),new ResizeObserver(()=>{G_.setupDPI(!0)}).observe(V_),H_.addEventListener(`pointerdown`,e=>{if(A_()||U_.state!==U.PLAYING||W_.isHitStopActive)return;let t=G_.getClickTarget(e.clientX,e.clientY,U_.currentRow);t&&t.row===U_.currentRow&&(W_.selectLaneWithHitStop(t.lane),e.pointerType===`touch`&&G_.clearHover())}),H_.addEventListener(`pointermove`,e=>{A_()||e.pointerType!==`touch`&&(U_.state===U.PLAYING&&!W_.isHitStopActive?G_.updateHover(e.clientX,e.clientY,U_.currentRow):G_.clearHover())}),H_.addEventListener(`pointerleave`,()=>{G_.clearHover()}),H_.addEventListener(`pointercancel`,()=>{G_.clearHover()});