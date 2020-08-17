import axios from "axios";

axios
  .get("https://us-central1-smclone-3d5f9.cloudfunctions.net/api/screams")
  .then(data => {
    console.log(data.data);
  })
  .catch(err => {
    console.log(err);
  });
