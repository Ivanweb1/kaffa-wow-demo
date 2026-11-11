import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname.slice(1));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.mp4':'video/mp4'};
createServer(async(req,res)=>{try{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const file=join(root,p);const info=await stat(file);if(!info.isFile())throw 0;res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file))}catch{res.writeHead(404);res.end('Not found')}}).listen(4470,'127.0.0.1',()=>console.log('KAFFA http://127.0.0.1:4470'));
