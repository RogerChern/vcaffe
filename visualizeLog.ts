/// <reference path="typings/main.d.ts" />

function displayFileInfo(files:FileList, id:string) {
    let output: string[] = [];
    for (let i = 0; files[i]; ++i) {
        let f = files[i];
        let [fileName, fileSize, fileType, fileLastMod] = [f.name, f.size, f.type, f.lastModifiedDate];
        let sizeUnit = ["B", "KB", "MB", "GB", "TB"];
        let sizeLevel = 0;
        while (fileSize >= 2 ** 10) {
            fileSize /= 2 ** 10;
            sizeLevel += 1; 
        }         
        let entry = `<li><strong>${fileName}</strong>(${fileType||"N.A."}), ${fileSize.toFixed(2)} ${sizeUnit[sizeLevel]}, last modified: ${fileLastMod} </li>`;
        output.push(entry);
    }
    document.getElementById(id).innerHTML = `<ul>${output.join('')}</ul>`;
}

function handleFileDrop(ev:DragEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    let files: FileList = ev.dataTransfer.files;
    displayFileInfo(files, "list_2");
    if (files[0]) {
        let file = files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {plotLog(parseLog(reader.result));};
    }
}

function handleFileSelect(ev:Event) {
    ev.stopPropagation();
    ev.preventDefault();
    let target = <HTMLInputElement>(ev.target);
    let files = target.files;
    displayFileInfo(files, "list_2");
    if (files[0]) {
        let file = files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {plotLog(parseLog(reader.result));};
    }
}

function handleDrag(ev:DragEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
}

function plotLog(log_data:number[][]) {
    let [train_iter, test_iter, train_loss, test_loss, test_accuracy] = log_data;
    let col1:any[] = ['loss-train'];
    let col2:any[] = ['train_iters'];
    let col3:any[] = ['accuracy-val'];
    let col4:any[] = ['loss-val'];
    let col5:any[] = ['val_iters'];
    col1.push(...train_loss.map((num) => {return Math.log(num);}));
    col2.push(...train_iter);
    col3.push(...test_accuracy);
    col4.push(...test_loss.map((num) => {return Math.log(num);}));
    col5.push(...test_iter);
    let data = {
        'xs': {'accuracy-val': 'val_iters', 'loss-train': 'train_iters', 'loss-val': 'val_iters'}, 
        'axes': {'accuracy-val': 'y2'}, 
        'names': {'accuracy-val': 'accuracy (val)', 'loss-train': 'loss (train)', 'loss-val': 'loss (val)'}, 
        'columns': [ col1,col2,col3,col4,col5 ]
    };
    drawCombinedGraph(data);
}

function parseLog(result:string) {
    let all_iter = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Iteration\s+\d+/g)
                         .map((str) => {return str.match(/Iteration \d+/)[0];})
                         .map((str) => {return str.match(/\d+/)[0];})
                         .map((str) => {return Number(str);})
    let train_loss = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Train net output #0: loss\s=\s+\d+(\.\d+)?/g)
                           .map((str) => {return str.match(/loss\s=\s+\d+(\.\d+)?/)[0];})
                           .map((str) => {return str.match(/\d+(\.\d+)?/)[0];})
                           .map((str) => {return Number(str);})
    let test_loss = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Test net output #1: loss =\s+\d+(\.\d+)?/g)
                          .map((str) => {return str.match(/loss\s=\s+\d+(\.\d+)?/)[0];})
                          .map((str) => {return str.match(/\d+(\.\d+)?/)[0];})
                          .map((str) => {return Number(str);})
    let test_accuracy = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Test net output #0: accuracy =\s+\d+(\.\d+)?/g)
                              .map((str) => {return str.match(/accuracy =\s+\d+(\.\d+)?/)[0];})
                              .map((str) => {return str.match(/\d+(\.\d+)?/)[0];})
                              .map((str) => {return Number(str);})
    let [train_iter, test_iter] = splitIter(all_iter);
    
    let train_iter_n: number[];
    let train_loss_n: number[];
    let test_iter_n: number[];
    let test_loss_n: number[];
    let test_accuracy_n: number[];
    
    train_loss = train_loss.map((val: number) => {return val == 0 ? 87 : val;});
    test_loss = test_loss.map((val: number) => {return val == 0 ? 87 : val;});
    
    return [train_iter, test_iter, train_loss, test_loss, test_accuracy];
}


function setError() {
    document.getElementById("list_2").innerText = "This file is not a log file!";
}

function splitIter(iter:number[]) {
    let train_iter: number[] = [];
    let test_iter: number[] = [];
    for (let i = 0; i < iter.length; ++i) {
        if (iter[i] != iter[i+1]) {
            train_iter.push(iter[i]);
        }
        else {
            test_iter.push(iter[i]);
        }
    }
    return [train_iter, test_iter];
}

function drawCombinedGraph(data) {
    // create instance of C3 chart
    let chart = c3.generate({
        data: data,
        bindto: '#chart',
        size: {
            height: 480,
        },
        axis: {
            x: {
                label: {
                    text: 'Iteration',
                    position: 'outer-center',
                },
                tick: {
                    // 3 sig-digs
                    format: (x:number) => { return Math.round(x*1000)/1000; },
                    fit: false,
                },
                min: 0,
                padding: {left: 0},
            },
            y: {
                label: {
                    text: 'Loss',
                    position: 'outer-middle',
                },
                padding: {bottom: 10},
                tick: {
                    format: (x:number) => { return (Math.E**x).toFixed(2); },
                },
            },
            y2: {
                show: true,
                label: {
                    text: 'Accuracy',
                    position: 'outer-middle',
                },
                min: 0,
                //max: 1,
                padding: {top: 10, bottom: 10},
            },
        },
        grid: { x: {show: true} },
        legend: { position: 'bottom' },
        transition: {
            duration: 0,
        },
        subchart: {
            show: true,
        },
        zoom: {
            rescale: true,
        },
    });
}

let dropZone = document.getElementById('file_drop');
dropZone.addEventListener('drop', handleFileDrop, false);
dropZone.addEventListener('dragover', handleDrag, false);
let selectTab = document.getElementById('file_select');
selectTab.addEventListener('change', handleFileSelect, false);