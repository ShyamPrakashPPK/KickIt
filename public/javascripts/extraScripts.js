


function search() {
    let strings = document.getElementById('searchBox').value
    console.log(strings,"---------");
    $.ajax({
        url: "/getSearch",
        data: {
            searchKey: strings
        },
        method: 'get',
        success: (response) => {
            if (response.length != 0) {
                document.getElementById("drop").innerHTML = ''
                for (i = 0; i < response.length; i++) {
                    const div1 = document.getElementById("drop");
                    const aTag = document.createElement('a');
                    aTag.setAttribute('href', "/details/" + response[i]._id);
                    aTag.innerText = response[i].title;
                    div1.appendChild(aTag);
                    const bTag = document.createElement('br');
                    div1.appendChild(bTag);
                }

            } else {
                document.getElementById("drop").innerHTML = ''


            }
        }
    })

}
function search2() {
    let searchKey = document.getElementById('searchBox').value
    console.log(searchKey,"**********");
    $.ajax({
        url: "/shop-list",
        method: 'get',
        success: (response) => {
            location.href = "/shop-list"
        }
    })

}




