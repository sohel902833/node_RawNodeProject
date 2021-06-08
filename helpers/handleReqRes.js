//dependencis
const {StringDecoder}=require('string_decoder');
const url=require('url')
const routes=require('../routes/routes')
const {notFoundHandler}=require('../handelers/routeHandler/notFoundHandler')
const {parseJSON}=require("../helpers/utilities")
//module scaffolding
const handler={}

handler.handleReqRes=(req,res)=>{ 
    const parsedUrl=url.parse(req.url,true)
    const path =parsedUrl.pathname;
    const trimmedPath=path.replace(/^\/+|\/+$/g,'')
    const method=req.method.toLowerCase();     
    const queryStringObject=parsedUrl.query;
    const headersObject=req.headers
   
    const requestProperties={
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject
    }



    const decoder=new StringDecoder('utf-8');
    let realData='';


    const chosenHandler=routes[trimmedPath]?routes[trimmedPath]:notFoundHandler

   


    req.on('data',(buffer)=>{
        realData+=decoder.write(buffer)
    })

    req.on('end',()=>{
        realData+=decoder.end();
        requestProperties.body=parseJSON(realData)

        chosenHandler(requestProperties,(statusCode,payload)=>{
            statusCode=typeof(statusCode) === 'number' ? statusCode:5000;
            payload=typeof(payload)==='object'?payload:{};
    
            const payloadString=JSON.stringify(payload)
            //return the final response
            res.setHeader('Content-Type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
        })



        // res.end(realData)
        // res.end("Hello Programs")
    })
}



module.exports=handler