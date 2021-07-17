import { Component,  EventEmitter,OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule,ReactiveFormsModule,FormBuilder, FormGroup, FormControl,  Validators } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { HttpService } from "./http.service";

import AgoraRTM from 'agora-rtm-sdk';
import RTMClient from 'agora-rtm-sdk'

//
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{


  title = 'frontend';

  messageArray:Array<{peerId:String,type:any,text:any}> = [];

  messageText:string;
AppId;
text:string;
  user:string;
  peerId:string;
  token:string;
file_name:any;
fileBlob:any;
msg:any;
error:any;


  client = AgoraRTM.createInstance('yourappid');



  ngOnInit(): void {

    this.subscribeEvents();
  }

  getimg: any = '';

finalimg:any;
subscribeEvents () {
console.log("message2")

     this.client.on('MessageFromPeer',async (message, peerId)  => {

       if (message.messageType === 'IMAGE') {
         const thumbnail=message.thumbnail;
       const blob = await this.client.downloadMedia(message.mediaId)
       console.log('--server blob--');
       console.log(blob);
       this.blobToImage(blob, (image) => {
         this.finalimg=image.src;

         this.messageArray.push({peerId:peerId,type:'image',text:image.src})

     })
 }
 else{

      this.messageArray.push({peerId:peerId,type:'text',text:message})
    }
})
}


  login(user,token){
    this.client.login({uid:this.user,token:this.token}).then(() => {
      this.msg="Login Success"
  console.log('AgoraRTM client login success');
}).catch(err => {
  this.error="Login Failed"
  console.log('AgoraRTM client login failure');
});
  }

  logout(){
    this.client.logout();
    this.msg="Logged Out"

  }


sendMessage (text,peerId) {
this.messageArray.push({peerId:'you',type:'text',text:{text}})
  this.client.sendMessageToPeer({text},peerId)
  .then(sendResult =>{
    if (sendResult.hasPeerReceived) {
       this.messageText=''
// this.messageArray.push({peerId:peerId,text:text})
}
else {
console.log("false");
 }
})

}



///////////////////////////////// uploadImage ////////////////////////




blobToImage (blob, cb)
{
 this.fileOrBlobToDataURL(blob, function (dataurl){
     var img = new Image()
     img.src = dataurl
     cb(img)
 })
 }

fileOrBlobToDataURL(blob, cb){
  console.log("hij",blob);
  const a = new FileReader();
  if(blob instanceof Blob)
  a.readAsDataURL(blob)
  a.onload = function (e){
    console.log("hio",e.target.result);


    cb(e.target.result);
  }

  // if(blob instanceof Blob)
   // a.readAsDataURL(blob)

}


////////////////////////////////select file ////////////
imageSource;
selectImage(event)
{
  const imageFile = event.target.files[0];
  const fileReader = new FileReader();
      fileReader.onload = () => {
         this.imageSource = fileReader.result;
      };

      fileReader.readAsDataURL(imageFile);

  this.fileBlob = (<HTMLInputElement>document.getElementById('fileinput')).files[0];
  console.log('--blob obj---');
  this.file_name = this.fileBlob.name

}
////////////////////////////// send file ///////////////////////////



sendimage(peerId){

  this.uploadImage(peerId);
}

async uploadImage(peerId){
  // Upload a Blob to the Agora server:
 const mediaMessage = await this.client.createMediaMessageByUploading(this.fileBlob, {
     messageType: 'IMAGE',
     fileName: this.file_name,
     description: 'send image',
     thumbnail: this.fileBlob,
     //width: 100,
     //height: 200,
     //thumbnailWidth: 50,
     //thumbnailHeight: 200,
     })

    var media_id='';

   this.messageArray.push({peerId:'you',type:'image',text:this.imageSource})
    this.client.sendMessageToPeer(mediaMessage, peerId).then(sendResult =>{
    if (sendResult) {
       console.log("done",mediaMessage.mediaId)
       media_id=mediaMessage.mediaId;
    }
    else {
    console.log("false");
    }
  console.log('media-id-'+media_id);
})

}







}
