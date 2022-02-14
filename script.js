var jogos = document.getElementsByName(`radiojogo`)

//Criação das configurações para o gráfico de barras
const ctx = document.getElementById("myChart");
const labels = [
    'CS:GO Player Average',
     'Valorant Player Average',
      'You'
]

const data =  {
    labels: ['All Player Mode', 'All Player Median','CS:GO Player Average', 'Valorant Player Average', 'You'],
    datasets: [{
        label: 'eDPI',
        data: [0,0,0,0,0],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
    }]
}

const config = {
    type: 'bar',
    data: data,
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
}

//Criar a tabela do chart.js
var myChart = new Chart(ctx, config)

//Chamar as funcoes dos objetos quando a pagina carrega
window.addEventListener(`load`, ()=> {
    valData.media()
    csgoData.media()
    allPlayerData.getData()
    createTable(0)
});

//Converter a sensibilidade do Valorant para o CSGO
function convertSense(num){
    let nSens = num / 0.314
    return nSens
}

//Funcao para obter os cm/360
function getTravelCm(sense){
    let jogo = document.getElementsByName(`radiojogo`)
    if(jogo[0].checked){
    let cmTrav = sense * 132.36
    return cmTrav
    }
    else{
        let cmTrav = (sense * 0.314) * 132.36
        return cmTrav
    }
}

//converter a sens do valorant para eDpi do CSGO
//Util para compara as médias de sens de eDPI do CSGO visto ser um jogo semelhante
function eDpiCSGO(dpi, sense){
    let eDPI = dpi * convertSense(sense)
    return eDPI
}

//eDpi de valorant
function eDpiVal(dpi, sense){
    let eDPI = dpi * sense 
    return eDPI
}

//funcao para arredondar às duas casas decimais
//O Math só permite arredondar numeros inteiros
function arredondar(num){
    let round = Math.round((num + Number.EPSILON) * 100) / 100
    return round
}

//Objeto para obter a média e mostrar no gráfico
let valData = {
    valAvg: 0,
    media(){
        fetch("dados/valodata.json")
        .then(response=>{
            return response.json();
        })
        .then(data => {   
            //Faz a média de edpi 300 jogadores de valorant
            var sum = 0
            for(var i = 0; i < 300; i++){        
                var num = parseInt(data[i].Edpi, 10)
                //Validação para campos vazios
                if(num > 10){
                    sum += num
                }
            }
            var media = Math.round(sum / 300) 
            this.valAvg = media
        });
    }
};


//Objeto de csgo que lê a média e mostrar no gráfico
let csgoData = {
    csAvg: 0,
    media(){
        fetch("dados/csgodata.json")
        .then(response=>{
            return response.json();
        })
        .then(data => {   
            //Faz a média de edpi 437 jogadores de CS:GO
            var avg = 0
            var sum = 0
            for(var i = 0; i < 431; i++){
                
                var num = parseInt(data[i].edpi, 10)
                
                //Validação para campos vazios
                if(num > 100){
                    sum += num
                }
            }
            avg = Math.round(sum / 300) 
            this.csAvg = avg 
        });
    }
};

let allPlayerData = {
    playerData: [],
    mediana: 0,
    moda: 0,
    getData(){
        fetch("dados/edpiall.json")
        .then(response=>{
            return response.json();
        })
        .then(data => {   
            //Loop para guardar os valores do json no vetor playerData
            for(var i = 0; i < 738; i++){      
                var num = parseInt(data[i].edpiall, 10)
                this.playerData[i] = num
            }
            
            //Os dados no json estão ordenados em ordem crescente
            this.mediana = this.playerData[(this.playerData.length / 2)]

            //Obter a moda
            //Obter quantas vezes o número se repete     
            let counter = []
            for(var i = 0; i < this.playerData.length; i++){
                let c = 0
                for(var pos = i + 1; pos < this.playerData.length - 1; pos++){
                        if(this.playerData[i] == this.playerData[pos]){
                            c++
                            counter[i] = c
                    }else{
                        break;
                    }
                }
            }

            //Obter qual é o maior número no vetor counter
            let maiorNumero = 0
            let numeroPos = 0
            for(var i = 0; i < counter.length; i++){
                if(i == 0){
                    maiorNumero = counter[i]
                }else{
                    if(counter[i] > maiorNumero){
                        maiorNumero = counter[i]
                        pos = [i]
                    }
                }
            }

            //moda recebe o valor com mais contagens 
            this.moda = this.playerData[pos]
        });

    }

};

function createTable(edpi){
    /*Tabela podia estar muito melhor implementada, não é escalavél da forma que se encontra
    devido ao código html e à forma como o loop opera, mas funciona. Há maneiras melhores
    para se implementar a tabela... Mas como o número de colunas pretendido é fixo
    ficou este código. */

    //obter os elementos da tabela gerados no html
    let table = document.getElementById('tabela')
    let thead = document.getElementById('thead')
    let tbody = document.getElementById('tbody');

    // Obter os headers da tabela (table header == th)
    //mostrar o que queremos
    let row_1 = document.getElementById('tr0');
    let heading_1 = document.getElementById('th0');
    heading_1.innerHTML = "eDPI";
    let heading_2 = document.getElementById('th1');
    heading_2.innerHTML = "DPI";
    let heading_3 = document.getElementById('th2');
    heading_3.innerHTML = "Target <br> Sensitivity";

    //Neste caso iteramos pelos DPI pretendidos, os mais usados na indústria dos ratos
    var linha, priDados, segDados, terDados
    var DPI = [400, 800, 1600, 3200]

    //Loop para gerar dados para as posições da tabela
    for(var i = 0; i < 4; i++){
        linha = document.getElementById(`col${i}`);
        priDados = document.getElementById(`priDados${i}`);
        segDados = document.getElementById(`segDados${i}`);
        terDados = document.getElementById(`terDados${i}`);

        priDados.innerHTML = ` ${edpi}`
        segDados.innerHTML = `${DPI[i]}`
        terDados.innerHTML = ` ${(edpi / DPI[i])}`
    }
}




function processData(){
    var dpi = document.getElementById("dpinum");
    var sense = document.getElementById("sensenum");
    var jogo = document.getElementsByName(`radiojogo`)

    csgoData.media()
    valData.media()
    allPlayerData.getData()

    if(dpi.value.length == 0 || sense.value.length == 0){
        window.alert("[ERROR] Missing data!")
    }else{
        dpi = Number(dpi.value)
        sense= Number(sense.value)

        if(jogo[0].checked){
        //Valorant

        let valedpi = eDpiVal(dpi, sense)
        let csgosense = arredondar(convertSense(sense))
        let distanceCm = arredondar(getTravelCm(sense))
        
        document.getElementById("valEDPI").innerHTML = `Valorant eDPI: ${valedpi}`;
        document.getElementById("dstCm").innerHTML = ` ${distanceCm} cm/360`;
        document.getElementById("csgoSense").innerHTML = `Target CS:GO Sensitivity ${csgosense.toFixed(2)}`;
        
        //atualizar dados na tabela
        data.datasets.forEach((dataset) => {
            dataset.data[0] = allPlayerData.moda
            dataset.data[1] = allPlayerData.mediana
            dataset.data[2] = Math.round((csgoData.csAvg * 0.314))
            dataset.data[3] = valData.valAvg
            dataset.data[4] = valedpi
        })

        createTable(valedpi)

        }else{
        //CS:GO

        let csgoedpi = arredondar((dpi * sense))
        let valoSense = sense * 0.314
        let distanceCm = arredondar(getTravelCm(sense))
        
        document.getElementById("valEDPI").innerHTML = `CS:GO eDPI: ${csgoedpi}`;
        document.getElementById("dstCm").innerHTML = ` ${distanceCm} cm/360`;
        document.getElementById("csgoSense").innerHTML = `Target Valorant Sensitivity ${valoSense.toFixed(3)}`;

        //atualizar dados na tabela
        data.datasets.forEach((dataset) => {
            dataset.data[0] = (allPlayerData.moda / 0.314)
            dataset.data[1] = (allPlayerData.mediana / 0.314)
            dataset.data[2] = csgoData.csAvg
            dataset.data[3] = Math.round((valData.valAvg / 0.314))
            dataset.data[4] = csgoedpi
        })

        createTable(csgoedpi)
        }

        //Atualiza a tabela com os dados inseridos nos dataset
        myChart.update()
    }
}

 