import Toastify from 'toastify-js' 

const style = {
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid'
}

const notification = (message) => {
    Toastify({
        text: message,
        duration: 5000,
        close: false,
        gravity: 'top',
        position: 'center',
        stopOnFocus: false,
        style: style
    }).showToast()
}

export default notification