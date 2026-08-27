//B"H
//B"H
//B"H
class AwtsmoosFloatHandler {
    constructor(){}
    static writeDynamicFloat(float) {
        var str = (float+"")
        var dot = str.indexOf(".")
        if(dot < 0) return null;

        var digitLength =  (str.length - 1)
        var tenthPlaces = digitLength - dot
        var coef = Math.round(
            float * Math.pow(10, tenthPlaces)
        );

        /**
            1 byte float:
            1 bit indicates:
                0: 1 decimal point
                1: 2

            7 LSBs number 0 - 127

            2 byte float:
                need to get 4 decimal points
                2 bits
            2 bits: 
                0 = 1 deciaml place
                1 = 2,
                2 = 3,
                3 = 4
            + 14 LSBs of the rest =
            coefficient of 2^14 max

            4 byte float: 
                8 decimal points
            need 4 bits

            32 - 4 = 28 bits for coefficinet
            2^28 max
            
        */
        var maxFloat8Coefficient = Math.pow(2, 7)
        var maxFloat16Coefficient = Math.pow(2, 14)
        var maxFloat32Coefficient = Math.pow(2, 28)

        var maxFloat8Decimals = 2
        var maxFloat16Decimals = 4
        var maxFloat32Deciamls = 8

        var type = null;
        var encodedNum = null;
        var decimalVal = tenthPlaces - 1;
        if(coef < maxFloat8Coefficient) {

            
            encodedNum =
                (
                    (
                        0b00000001 & 
                        decimalVal
                    ) << 7
                ) | coef
            
        } else if(coef < maxFloat16Coefficient) {
            encodedNum =
                (
                    (
                        0b00000011 & 
                        decimalVal
                    ) << 14
                ) | coef
            
        } else if(coef < maxFloat32Coefficient) {
            encodedNum =
                (
                    (
                        0b00001111 & 
                        decimalVal
                    ) << 28
                ) | coef
            
        }
        
     //   console.log(coef,decimalVal,encodedNum,digitLength);
        return encodedNum;
    }

    static decodeEncodedFloat(encoded) {
        var coef = 0
        var decimals = 0;
    
        if(encoded < 256) {
            decimals = ((
                0b10000000 & encoded
            ) >> 7) + 1
            
            coef = 0b01111111 & encoded;
 
        } else if(encoded < Math.pow(2, 16)) {
            decimals = ((
                (0b11000000 << 8) & encoded
            ) >> 14) + 1
            coef = 0b0011111111111111 & encoded;
        } else if(encoded < Math.pow(2, 32)) {
            decimals = ((
                (0b11110000 << 24) & encoded
            ) >> 28) + 1
            coef = 0b00001111111111111111111111111111 & encoded;
        }
       // console.log(decimals,coef)
        return coef / Math.pow(10, decimals);
    }
}


module.exports = AwtsmoosFloatHandler