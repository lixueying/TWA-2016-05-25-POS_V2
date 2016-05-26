function splitInputs(inputs){
    var splitedInputs = [];
    inputs.forEach(function(input){
        var splitBarcode = [];
        splitBarcode = input.split('-');
        splitedInputs.push({barcode:splitBarcode[0],count:parseInt(splitBarcode[1]) || 1});
    });
    return splitedInputs;
}

function mergedBarcode(splitInputs){
    var BarcodeList = [];
        splitInputs.forEach(function(input){
            var existItem = BarcodeList.find(function(item){
                return item.barcode === input.barcode
                });
            if(!existItem){
                BarcodeList.push(Object.assign(input));
            }else{
            existItem.count++;
            }
        });
        return BarcodeList;
}

function mergedItems(BarcodeList){
    var items = [];
        var allItem = loadAllItems();
        BarcodeList.forEach(function(input){
            var item = allItem.find(function(e){
                return e.barcode === input.barcode;
            });
        items.push(Object.assign({count:input.count}, item));
        });
        return items;
}

function isPromotion(items){
    var discountList = [];
        var allPromotion = loadPromotions();
        var promotionBarcode = allPromotion[0].barcodes;
        promotionBarcode.forEach(function(element){
            var item = items.find(function(e){
                return e.barcode === element;
            });
            if(item){
               discountList.push({
                       barcode:item.barcode,
                       name: item.name,
                       unit:item.unit,
                       price:item.price,
                       type:'BUY_TWO_GET_ONE_FREE',
                       count:Math.floor(item.count/3)
                       });
            }
        });
        return discountList;
}

function calculateSubtotalPrice(items){
    var subtotalItem=[];
        subtotalItem = items.map(function(item) {
            return Object.assign({
              subTotal: item.count * item.price,
            }, item);
        });
        return subtotalItem;
}
function applyPromotion(subtotalItem, discountList){
    var cartItems = [];
    subtotalItem.forEach(function(item){
        var existDiscount = discountList.find(function(e){
            return item.barcode === e.barcode;
        });
        if(!existDiscount){
            cartItems.push(Object.assign({promotedSubtotal:item.subTotal},item));
          }else{
            cartItems.push(Object.assign({
                            promotedSubtotal:item.subTotal - existDiscount.count * existDiscount.price
                            },item));
        }
    });
    return cartItems;
}

function calculateTotalPrice(cartItems){
    var totalPrice = 0;
    cartItems.forEach(function(item){
       totalPrice = totalPrice + item.promotedSubtotal;
    });
    return totalPrice;
}

function calculateDiscountPrice(cartItems, totalPrice){
        return cartItems.reduce(function(a,b){
                return {subTotal:a.subTotal + b.subTotal};
            }).subTotal - totalPrice;
}

function print(cartItems, totalPrice, discountPrice, discountList){
    var dateDigitToString = function (num) {
             return num < 10 ? '0' + num : num;
         };
         var currentDate = new Date(),
                    year = dateDigitToString(currentDate.getFullYear()),
                    month = dateDigitToString(currentDate.getMonth() + 1),
                    date = dateDigitToString(currentDate.getDate()),
                    hour = dateDigitToString(currentDate.getHours()),
                    minute = dateDigitToString(currentDate.getMinutes()),
                    second = dateDigitToString(currentDate.getSeconds()),
                    formattedDateString = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second;
         var outString = '***<没钱赚商店>购物清单***\n' +
                     '打印时间：' + formattedDateString + '\n' +
                     '----------------------\n' ;
         cartItems.forEach(function(item) {
             outString += `名称：${item.name}，数量：${item.count}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${item.promotedSubtotal.toFixed(2)}(元)\n`;
           });
         outString += '----------------------\n' +
                      '挥泪赠送商品：\n';
         discountList.forEach(function(e){
             outString += `名称：${e.name}，数量：${e.count}${e.unit}\n`;
         });
         outString += '----------------------\n' +
                     `总计：${totalPrice.toFixed(2)}(元)\n` +
                     `节省：${discountPrice.toFixed(2)}(元)\n` +
                     '**********************';
         console.log(outString);
}
function printInventory(inputs){
    var splitedInputs = splitInputs(inputs);
    var BarcodeList = mergedBarcode(splitedInputs);
    var items = mergedItems(BarcodeList);
    var discountList = isPromotion(items);
    var subtotalItem = calculateSubtotalPrice(items);
    var cartItems = applyPromotion(subtotalItem, discountList);
    var totalPrice = calculateTotalPrice(cartItems);
    var discountPrice = calculateDiscountPrice(cartItems, totalPrice);
    print(cartItems, totalPrice, discountPrice, discountList);
}