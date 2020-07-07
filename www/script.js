function changeAlert(id, alert, success = false, text = "") {

    var warn = id == 1 ? document.getElementById("warn") : document.getElementById("warn2"),
        warnButtonNew = id == 1 ? "warnButtonNew" : "warnButton2New",
        nameText = id == 1 ? document.getElementById("nameText") : document.getElementById("nameText2"),
        phoneText = id == 1 ? document.getElementById("phoneText") : document.getElementById("phoneText2"),
        sendButton = id == 1 ? document.getElementById("sendButton") : document.getElementById("sendButton2");

    var normal = alert ? "none" : "block",
        reverse  = alert ? "block" : "none",
        resText;

    switch(text) {
        case 'invalid':
            resText = '<strong>:/</strong><br><br>Acho que seu WhatsApp tá errado, dá uma conferida...';
            break;
        case 'empty':
            resText = '<strong>:/</strong><br><br>Acho que você esqueceu alguma coisa...';
            break;
        case 'registered':
            resText = '<strong>:)</strong><br><br>Seu número já tá cadastrado com a gente!';
            break;
        case 'successful':
            resText = '<strong>:)</strong><br><br>Parabéns! Agora é só aguardar o link no seu WhatsApp!';
            break;
        default:
            resText = 'Ops, tivemos um erro! Tente novamente.';
            break;
    }

    if (success){
      //WhatsApp já cadastrado!
        warn.className = "alert alert-success mt-5";
        warn.innerHTML = resText;

    }else{
        warn.className = "alert alert-warning mt-5";
        warn.innerHTML = `<button id="${warnButtonNew}" type="button" class="close" aria-label="Close"> <span aria-hidden="true">&times;</span> </button>` + resText;
        document.getElementById(warnButtonNew).addEventListener('click', (e) => {
              onWarnClose(id, e);
         });
    }

    warn.style.display = reverse;
    nameText.style.display = normal;
    phoneText.style.display = normal;
    sendButton.style.display = normal;
}

function sendForm(id) {

    var warn = id == 1 ? document.getElementById("warn") : document.getElementById("warn2"),
        nameText = id == 1 ? document.getElementById("nameText").value : document.getElementById("nameText2").value,
        phoneText = id == 1 ? document.getElementById("phoneText").value : document.getElementById("phoneText2").value,
        sendButton = id == 1 ? document.getElementById("sendButton") : document.getElementById("sendButton2");

    var data = { nome: nameText, telefone: phoneText };
    var xhttp = new XMLHttpRequest();
    // Quando recebemos a resposta do servidor
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            var recebido = JSON.parse(this.responseText);
            changeAlert(1, true, recebido.success, recebido.message);
            changeAlert(2, true, recebido.success, recebido.message);
            sendButton.innerHTML = "CADASTRAR";

        }
    };
    // ---------------------------------- //

    // Mandando a informação para o servidor
    xhttp.open("POST", "http://localhost:9000/cadastrarEspera", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
    // ---------------------------------- //
}

function phone_formatting(ele, restore) {
  var new_number,
      selection_start = ele.selectionStart,
      selection_end = ele.selectionEnd,
      number = ele.value.replace(/\D/g,'');

  if (number.length >= 1){
    new_number = '(' + number;

    if (number.length >= 2) {

      new_number = '(' + number.substring(0, 2) + ') ';

      if (number.length >= 3 && number.length < 6)
        new_number += number.substring(2, number.length);
      else if (number.length >= 6){
        new_number += number.substring(2, 6) + '-' + number.substring(6, number.length);

        if (number.length >= 11){
          new_number = '(' + number.substring(0, 2) + ') ' + number.substring(2, 7) + '-' + number.substring(7, 11);
        }
      }
    }
  } else {
    new_number = number;
  }

  ele.value =  (new_number.length > 15) ? new_number.substring(15,0) : new_number;

  if (restore === false && new_number.length < 14) {
      selection_start = new_number.length;
      selection_end = new_number.length;
  }
  else if (restore === 'revert') {
    selection_start--;
    selection_end--;
  }

  ele.setSelectionRange(selection_start, selection_end);

}

function phone_number_check(field, e, id) {
  var key_code = e.keyCode,
      //key_string = String.fromCharCode(key_code),
      key_string = String.fromCharCode((96 <= key_code && key_code <= 105)? key_code-48 : key_code),
      press_delete = false,
      dash_key = 189,
      delete_key = [8,46],
      direction_key = [33,34,35,36,37,38,39,40],
      selection_end = field.selectionEnd;

      if(key_code == 13){
        document.getElementById('sendButton' + id).click();
        return;
      }
  // delete key was pressed
  if (delete_key.indexOf(key_code) > -1) {
    press_delete = true;
  }
  // only force formatting is a number or delete key was pressed
  if (key_string.match(/^\d+$/) || press_delete) {
    phone_formatting(field,press_delete);
  }
  // do nothing for direction keys, keep their default actions
  else if(direction_key.indexOf(key_code) > -1) {
    // do nothing
  }
  else if(dash_key === key_code) {
    if (selection_end === field.value.length) {
      field.value = field.value.slice(0,-1)
    }
    else {
      field.value = field.value.substring(0,(selection_end - 1)) + field.value.substr(selection_end)
      field.selectionEnd = selection_end - 1;
    }
  }
  // all other non numerical key presses, remove their value
  else {
    e.preventDefault();
//    field.value = field.value.replace(/[^0-9\-]/g,'')
    phone_formatting(field,'revert');
  }

}

function onWarnClose(id, e) {
    e.preventDefault();
    changeAlert(1, false);
    changeAlert(2, false);
}

document.getElementById('warnButton').addEventListener('click', (e) => {
    onWarnClose(1, e);
});

document.getElementById('phoneText').onkeyup = function (e) {
      phone_number_check(this, e, "");
};

document.getElementById('sendButton').onclick = function(e) {
    this.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ENVIANDO...`;
    sendForm(1);
};


document.getElementById('warnButton2').addEventListener('click', (e) => {
    onWarnClose(2, e);
});

document.getElementById('phoneText2').onkeyup = function (e) {
      phone_number_check(this, e, 2);
};

document.getElementById('sendButton2').onclick = function(e) {
    this.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ENVIANDO...`;
    sendForm(2);
};
