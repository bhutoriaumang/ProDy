var pos = -1;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    // try{
    //   var pos = (doc.data().position);
    // }
    // catch(Exception){
    //   return;
    // }

    var user = firebase.auth().currentUser;

    if(user != null){
      db.collection('employees').doc(user.uid).get().then(doc =>{
        try{
          pos = doc.data().position;
        }
        catch(err){
          pos = document.getElementById("newpos_field").value;
        }
        // var pos = 1;
        if(pos==1){
          manager();
        }
        else if(pos==0){
          employee(user.uid);
        }
      })
    }

  } else {
    // No user is signed in.

    document.getElementById("user_div").style.display = "none";
    document.getElementById("sign_up").style.display = "none";
    document.getElementById("login_div").style.display = "block";
    document.getElementById("manager-login").style.display = "none";

  }
});

function login(){

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    window.alert("Error : " + errorMessage);

    // ...
  });

}

function signup(){
    document.getElementById("user_div").style.display = "none";
    document.getElementById("sign_up").style.display = "block";
    document.getElementById("login_div").style.display = "none";
    document.getElementById("manager-login").style.display = "none";


}

function create(){

  var email = document.getElementById("newemail_field").value;
  var pass = document.getElementById("newpassword_field").value;
  pos = document.getElementById("newpos_field").value;

  firebase.auth().createUserWithEmailAndPassword(email, pass).then((cred) => {
    // Signed in 
    var user = cred.user;
    return db.collection('employees').doc(cred.user.uid).set({
        email: email,
        id: cred.user.uid,
        position: pos,
        tasks: ["task 1","task 2","task 3"],
    })
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ..
  });
}

function logout(){
  firebase.auth().signOut();
}

function employee(id){
  //employee page
  document.getElementById("user_div").style.display = "block";
  document.getElementById("login_div").style.display = "none";
  document.getElementById("sign_up").style.display = "none";
  document.getElementById("manager-login").style.display = "none";
  console.log("Employee");
  db.collection('employees').where("id","==",id).onSnapshot(snapshot =>{
    let changes = snapshot.docChanges();
    console.log(changes);
    changes.forEach(change => {
      let data = change.doc.data();
      console.log(data);
      let tasks = data.tasks;
      let index = 0;
      var list = document.getElementById('tasks');
      const li_parent = document.createElement('li');
      while(index<tasks.length){
        const li = document.createElement('li');
        li.innerHTML = tasks[index];
        list.appendChild(li);
        index++;
      }
    })
  })
  
}


function manager(){
  //manager page
  console.log("Manager");
  document.getElementById("user_div").style.display = "none";
  document.getElementById("login_div").style.display = "none";
  document.getElementById("sign_up").style.display = "none";
  document.getElementById("manager-login").style.display = "block";
  db.collection('employees').where("position","==","0").onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    var list = document.getElementById('employee-details');
    changes.forEach(change => {
      var data = change.doc.data();
      let tasks = data.tasks;
      let index = 0;
      const li_parent = document.createElement('li');
      li_parent.appendChild(document.createTextNode(data.email));
      const li_child = document.createElement('ol');
      while(index<tasks.length){
        const li = document.createElement('li');
        li.innerHTML = tasks[index];
        let butn = document.createElement('button');
        butn.innerHTML = "-";
        butn.className = "delete-button";
        butn.style.width = "2px";
        butn.style.height = "2px";
        butn.value = index;
        butn.onclick = function(){
          var ele = db.collection('employees').doc(data.id);
          let t = [];
          let k =0;
          while(k<tasks.length){
            if(k == this.value){
              k++;
              continue;
            }
            t.push(tasks[k]);
            k++;
          }
          ele.update({
            tasks: t
          });
          li_parent.style.display = "none"
        };
        li.appendChild(butn);
        li_child.appendChild(li);
        index++;
      }
      let button = document.createElement('button');
      button.innerHTML = "Add Task";
      button.className = "inner-button";
      button.onclick = function(){
        button.style.display = 'none';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Add a task';
        input.id = 'newtask';
        li_parent.appendChild(input);
        const butn = document.createElement('button');
        const cross = document.createElement('button');
        butn.innerHTML = 'Add task';
        butn.className = 'newtaskbutton';
        cross.innerHTML = 'X';
        cross.className = 'newtaskbutton';
        butn.onclick = function(){
          if(input.value==''){
            window.alert('No task specified');
            return;
          }
          var ele = db.collection('employees').doc(""+data.id+"");
          let t = tasks;
          t.push(input.value);
          console.log(t);
          ele.update({
            tasks: t
          });
          li_parent.style.display = 'none';
        };
        cross.onclick = function(){
          butn.style.display = 'none';
          cross.style.display = 'none';
          input.style.display = 'none';
          button.style.display = 'block';
        };
        li_parent.appendChild(butn);
        li_parent.appendChild(cross);
      };
      li_parent.appendChild(li_child);
      li_parent.appendChild(button);
      list.appendChild(li_parent);
    })
  })
}