let lineCounter = 1;
let lastHelpRequestName = "";


const baseApiUrl = "http://localhost:8080/api/"

function createLine(id, date, description, appreunant, solved) {

    let tablerow = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerText = id;

    let td2 = document.createElement("td");
    td2.innerText = date;

    let td3 = document.createElement("td");
    td3.innerText = description;

    let td4 = document.createElement("td");
    td4.id = appreunant;
    td4.innerText = tabLearners[0][appreunant]["id"];
    //td4.innerText = document.getElementById("learner-select").getElementsByTagName("option").item(appreunant).innerText;

    let td5 = document.createElement("td");
    td5.innerText = solved

    const td6 = document.createElement("td");
    const button = document.createElement("button");
    button.textContent = "Je passe mon tour";

    button.addEventListener("click", function () {
        if (button.parentElement.parentElement.className === "line-through") {
            button.parentElement.parentElement.className = "";
            button.textContent = "Je passe mon tour";
        } else {
            button.parentElement.parentElement.className = "line-through";
            button.textContent = "Je veux mon tour";
        }
    });
    td6.appendChild(button);

    tablerow.appendChild(td1);
    tablerow.appendChild(td2);
    tablerow.appendChild(td3);
    tablerow.appendChild(td4);
    tablerow.appendChild(td5);
    tablerow.appendChild(td6);

    return tablerow;

}

//Fonction pour afficher les Classroom
function printClassroom(baseApiUrl) {
    let choice = "classrooms"
//Appel API
    fetch(baseApiUrl + choice).then(function (response) {
        response.json().then(function (result) {

            console.log("Liste_Classroom: " + result);
            //Ajout d'un evenement "onchange"
            let list = document.getElementById("classroom-select");
            list.addEventListener("change", function (){
                printLearner(baseApiUrl, list.value);
            })


            //Création des options
            let select = document.getElementById("classroom-select");
            for (let i = 0; i < result.length; i++) {
                let option = document.createElement("option");
                option.innerText = result[i]["name"];
                option.value = result[i]["id"];
                select.appendChild(option);
            }

            let idClassroom = document.getElementById("classroom-select").value;
            printLearner(baseApiUrl, idClassroom);


        })
    })
}

//Tableau local de learners
let tabLearners = [];

// Fonction pour afficher les learners
function printLearner(baseApiUrl, idClassroom) {
    console.log(idClassroom)
    let choice = 'learners/byclassroom/' + idClassroom;
    console.log("url_learners: " + choice)
//Appel API
    fetch(baseApiUrl + choice).then(function (response) {
        response.json().then(function (result) {

            //Effacer la liste présente
            document.getElementById("learner-select").innerHTML = '';

            let select = document.getElementById("learner-select");
            for (let i = 0; i < result.length; i++) {
                let option = document.createElement("option");
                option.innerText = result[i]["firstName"] + ' ' + result[i]["lastName"];
                option.value = result[i]["id"];
                select.appendChild(option);
                //Alimentation du tableau d'appreunant.

            }
            tabLearners.push(result);

            printTickets(baseApiUrl, idClassroom);
        })
    })
}


// Fonction pour afficher les tickets
function printTickets(baseApiUrl, idClassroom) {
    let choice = "tickets/byclassroom/" + idClassroom
    //Ajouter l'idClassroom
    console.log('Url des tickets: ' + choice)
//Appel API
    fetch(baseApiUrl + choice).then(function (response) {
        response.json().then(function (result) {
console.log('Tickets: ' + result[0].id)
            //Permet de vider le tableau de ses précédentes valeurs
            document.getElementById('table-body').innerHTML = "";

            let tableBody = document.getElementById("table-body");
            for (let i = 0; i < result.length; i++) {
                tableBody.appendChild(createLine(result[i].id, result[i].date, result[i].description, result[i].learnerIdx, result[i].solved));
            }
        })
    })
}


//Bouton ajout de ticket "Je veux de l'aide"
document.getElementById("help-form").addEventListener("submit", function (event) {
    event.preventDefault();

    //On recherche si l'idLearner est présent dans les tickets
    let idLearner = document.getElementById("learner-select").value

    //Recherche de cet Id dans le tableau
    let collection = document.getElementById("table-body").getElementsByTagName("td");
    let trouve = false;
    for (let i = 0; i < collection.length; i++)
    {
        if (collection[i]["id"] == idLearner) {
            alert("Tu es déjà dans la liste Coco!");
            trouve = true;
            break;
        }
    }

    //Si l'id n'existe pas, on insère le ticket
    if (!trouve) {
        let requestDetails = {
            // On choisit la méthode
            method: "POST",
            // On définit le corps de la requête
            body: JSON.stringify({
                date: new Date(),
                description: document.getElementById("input-description").value,
                learnerIdx: document.getElementById("learner-select").value,
                solved: false
            }),
            // On dit qu'on envoit du JSON
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
        fetch(baseApiUrl + 'tickets', requestDetails).then(function (response) {
            response.json().then(function (result) {
                console.log(result);
                //On actualise le tableau
                //Appel de la fonction printTickets
                //printTickets(baseApiUrl);

                let tableBody = document.getElementById("table-body");
                tableBody.appendChild(createLine(result.id, result.date, result.description, result.learnerIdx, result.solved));
                document.getElementById("input-description").value = "";
            })
        })
    }
});


//Prise en charge des tickets
document.getElementById("button-next").addEventListener("click", function () {
    const nameTable = document.getElementById("table-body");

    if (nameTable.firstElementChild !== null) {
        let rowNumber = nameTable.firstElementChild.firstElementChild.textContent;
        let choice = "tickets/" + rowNumber;

        fetch(baseApiUrl + choice, {method : "DELETE"}).then(function (result) {
                    nameTable.removeChild(nameTable.firstElementChild);

        })
    }
});

printClassroom(baseApiUrl);

