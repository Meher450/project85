import React,{Component} from "react";
import  {View, StyleSheet, Button} from "react-native";
import * as Google from "expo-google-app-auth";
import firebase from "firebase";

export default class LoginScreen extends Component{
  isUserEqual=(googleUser,firebaseUser)=>{
    if(firebaseUser){
      var providerData=firebaseUser.providerData
      for(var i=0 ; i<providerData.length ; i++){
        if(providerData[i].providerId===firebase.auth.GoogleAuthProvider.PROVIDER_ID&&
        providerData[i].uid===googleUser.getBasicProfile().getId() ){
          return true
        }
      }
    }
    return false
  }
  onSignIn=googleUser=>{
    var unsubscribe=firebase.auth().onAuthStateChanged(firebaseUser=>{
      unsubscribe()
      if(!this.isUserEqual(googleUser,firebaseUser)){
        var credential=firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
        )
        firebase
        .auth()
        .signInWithCredential(credential)
        .then(function(result){
          if(result.additionalUserInfo.isNewUser){
            firebase
            .database()
            .ref("/users/"+result.user.uid)
            .set({
              gmail:result.user.email,
              profile_picture:result.additionalUserInfo.profile.picture,
              locale:result.additionalUserInfo.profile.locale,
              first_Name:result.additionalUserInfo.profile.given_Name,
              last_Name:result.additionalUserInfo.profile.family_Name,
              current_theme:"dark"
            })
            .then(function(snapshot){})
          }
        })
        .catch(error=>{
          var errorCode=error.code
          var errorMessage=error.message
          var email=error.email
          var credential=error.credential
        })
      }
      else{
        console.log("User already Signed in firebase")
      }
    })
  }
  signInWithGoogleAsync=async()=>{
    try{
      const result=await Google.logInAsync({
        behavior:"web",
        androidClientId:"458026546542-6uktd6r7mpggdvigjbpcb8nk28g63bfc.apps.googleusercontent.com",
        iosClientId:"458026546542-n8s9fb1a5goj11t09krl4a9au4euup7p.apps.googleusercontent.com",
        scopes:["profile","email"]
      })
      if(result.type==="success"){
        this.onSignIn(result)
        return result.accessToken
      }
      else{
        return{cancelled:true}
      }
    }
    catch(e){
    console.log(e.message)
    return{error:true}
    }
  } 
  render(){
    return(
      <View style={styles.container}>
      <Button title="SIGN IN WITH GOOGLE"
      onPress={()=>this.signInWithGoogleAsync()}></Button>
      </View>
    )
  }
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  }
})