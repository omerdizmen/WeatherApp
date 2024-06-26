import icons from "url:../../img/icons.svg" // parcel1

export default class View{
    _data;
    render(data, render = true){    
        if(!data || (Array.isArray(data) && data.length === 0)){
            return this.renderError();
        }

        this._data = data;
        const markup = this._generateMarkup();
        // console.log(markup);
        if(render === false){
          return markup;
        }

        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }

    update(data){

      this._data = data;
      const newMarkup = this._generateMarkup();

      const newDOM = document.createRange().createContextualFragment(newMarkup);
      const newElements = Array.from(newDOM.querySelectorAll("*"));
      const curElements = Array.from(this._parentElement.querySelectorAll("*"));

      // updates
      newElements.forEach((newEl, i) => {
        const curEl = curElements[i];
        
        if(newEl.isEqualNode(curEl) === false && newEl.firstChild?.nodeValue.trim() !== ""){
          console.log(curEl + " cur el");
          curEl.textContent = newEl.textContent;
        }

        if(!newEl.isEqualNode(curEl)){
          Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
        }
              
        
      });

    }

    _clear(){
        this._parentElement.innerHTML = "";
    }

    renderSpinner(){
        const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
        `;
        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
      }
    
    renderError(message = this._errorMesage){
      const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
      `;

      this._clear();
      this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }

    renderMessage(message = this._message){
      const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
      `;
    }
}