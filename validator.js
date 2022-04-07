


function validator (options){
    
    function getParent (inputElement, selector){
        while(inputElement.parentElement){
            if (inputElement.parentElement.matches(selector)){
                return inputElement.parentElement
            }
            inputElement = inputElement.parentElement
        }
    }


    var formElement = document.querySelector(options.form)
    
    var selectorRules = {};
    
    
    // Hàm thực hiện validate (xác nhận)
    function validate (inputElement, rule){
        var errorMesSage ;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        
        // lấy ra các rule của chính selector
        var rules = selectorRules[rule.selector]
        // lặp qua từng rule và kiểm tra 
        // nếu có lỗi thì dừng việc kiểm tra    
        for(var i = 0; i < rules.length; ++i){

            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMesSage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );   
                    break;
                default:
                    errorMesSage = rules[i](inputElement.value);

            }
            if(errorMesSage){
                break;
            }
        }
        

        if(errorMesSage){
            errorElement.innerText = errorMesSage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }else{
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

        }  
        
        return !errorMesSage
    }
    
    // 
    if(formElement){
        // lắng nghe sự kiện submit 
        formElement.onsubmit = function(e){
            e.preventDefault();
            
            var isFormValid = true;

            options.rules.forEach(function(rule){
                var inputElement =  formElement.querySelector(rule.selector)
                
                var isvalid = validate(inputElement, rule)
                if(!isvalid){
                    isFormValid = false;
                }
               
                
            });
            
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch (input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) return values
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value    
                        }   
                        return values
                    }, {});
                    options.onSubmit(formValues)
                }
            }
        }    

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input ....)
        options.rules.forEach(function(rule){

            // lưu lại các rule cho mỗi inputElement
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement){
                if(inputElement){
                    // xử lý khi blur ra ngoài từ chính input 
                    inputElement.onblur = function(){
                        validate(inputElement, rule)
    
                    } 
                    // xử lý khi người dùng nhập vào input
                    inputElement.oninput = function(){
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
    
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }               
                }
            })

            
        })
    }

}

validator.isRequired = function(selector){
    return {
        selector: selector,
        test(value){
            return value ? undefined :  'Vui lòng nhập trường này!'

        }

    }
}

validator.isEmail = function(selector){
    return{
        selector: selector,
        test(value){
            const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
            return regex.test(value) ? undefined : 'Truờng này phải là Email'            
        }

    }
}
validator.minLength = function(selector, min){
    return{
        selector: selector,
        test(value){
            
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự.`            
        }

    }
}
validator.confirmed = function(selector, getConfirmValue, message){
    return {
        selector,
        test(value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không đúng!'
        }
    }
}


