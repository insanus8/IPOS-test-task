const square = $('.square'),
      circle = $('.circle'),
      form = $('.form'),
      select = $('select'),
      marksSelector = $('.marks'),
      modelsSelector = $('.models'), 
      yearsSelector = $('.years'),
      btnSubmit = $('.btn--submit')
      calendar = $('.calendar'),
      calendarValue = $('.calendar_value'),
      informationDelivery = $('.information-delivery')

let cars = [],
      marks = [],
      models = [], 
      years = [],
      delivery = [],
      minDateDelivery = '',
      maxDateDelivery = '',
      selectedOption = {
            mark: '',
            model: '',
            year: ''
      }

function intro() {
      btnSubmit.hide() 
      circle.prop('disabled', true)
      startingData()
      setTimeout(() => {
            square.each(function() {
                  let coordinate = {
                        'opacity': '0',
                        'margin': '0',
                        'bottom': '-125px',
                        'right': '-125px',
                        'left': 'auto'
                  }

                  if ($(this).offset().top < (window.innerHeight / 2)) coordinate['top'] = '-125px'
                  if ($(this).offset().left < (window.innerWidth / 2))  coordinate['left'] = '-125px'

            
                  $(this).animate(coordinate, 3000, function() {
                        $('.square__wrapp').hide()
                        $(this).removeAttr("style")
                        $(this).stop(true,true).animate()
                        circle.animate({'opacity': '1'}, 2000, function() {
                              circle.removeClass('circle--inverted')
                              setTimeout(()=> circle.prop('disabled', false), 2000)
                              circle.click(function() {
                                    form.css('visibility', 'visible')
                                    form.animate({'opacity': '1'}, 2000)
                                    circle.animate({'opacity': '0'}, 2000, function() {
                                          circle.addClass('circle--inverted')
                                    })
                              })
                        })
                  })
            })
      },1500)
}
intro()

select.each(function() {
      $(this).change(function(){
            marks = []
            models = []
            years = []

            if($(this).hasClass("marks")) {
                  selectedOption.mark = $(this).val() 
                  dataFiltering('mark', $(this).val())     
            } else if($(this).hasClass("models")) {
                  selectedOption.model = $(this).val()
                  dataFiltering('model', $(this).val())
            } else {
                  selectedOption.year = $(this).val()
                  dataFiltering('year', $(this).val())
            }

            $('.form__option').remove()

            displayOptions()
            createOption(marksSelector, marks)
            createOption(modelsSelector, models)
            createOption(yearsSelector, years)
            for (const key in cars) {
                  if (selectedOption.mark == cars[key].mark
                  && selectedOption.model == cars[key].model
                  && selectedOption.year == cars[key].year) {
                        btnSubmit.show(300)
                        delivery.push(cars[key].delivery)
                  }
            }
            if (delivery.length != 0) calculationDates()
      })
})

function startingData() {
      $.getJSON( "https://insanus8.github.io/IPOS-test-task/", function(data){
            cars = data 
            displayOptions()
            createOption(marksSelector, marks)
            createOption(modelsSelector, models)
            createOption(yearsSelector, years)
      })
}

function createOption(selector, arr) {
      let arr_2 = arr.filter((item, index) => {
            return arr.indexOf(item) === index
      })      
      for (const key in arr_2) {
            selector.append(`<option class="form__option" value="${arr_2[key]}">${arr_2[key]}</option>`)
      }
}

function displayOptions() {
      for (const key in cars) {
            marks.push(cars[key].mark)
            models.push(cars[key].model)
            years.push(cars[key].year)
      }
}

function dataFiltering (filter, value) {
      const  result = cars.filter(car => car[filter] == value);
      cars = result
}

btnSubmit.click(function(e) {
      e.preventDefault()
      setUpCalendar()
})

function setUpCalendar() {
      calendarSettings();
      calendarValue.val(minDateDelivery)
      calendar.datepicker({
            changeMonth: true,
            changeYear: true,
            minDate: minDateDelivery,
		maxDate: maxDateDelivery,
            onSelect: function(date){
                  calendarValue.val(date)
                  calendar.animate({'opacity': '0'}, 1000, function() {
                        informationDelivery.css('visibility', 'visible')
                        informationDelivery.animate({'opacity': '1'}, 600, function() {
                              calendar.removeAttr("style")
                              $('.anew').click(anew)
                        })
                        informationDelivery.append(`Вы выбрали ${selectedOption.mark} ${selectedOption.model} ${selectedOption.year},<br> доставка ${date}<br> <button class="anew">Начать заново</button>`)
                  })
                  form.stop(true,true).animate()
                  form.animate({'opacity': '0'}, 1000, function() {
                        form.removeAttr("style")
                  })
            },
            beforeShowDay: function(date){
                  let seconds = Date.parse(date)
      
                  for (const key in delivery) {
                        if (delivery[key][0] <= (seconds + 24*60*60*1000 ) 
                        && seconds <= delivery[key][1]) {
                              return [true]
                        }
                  }
      
                  return [false]
            }
      })
      calendar.datepicker("setDate", calendarValue.val())
      calendar.css('visibility', 'visible')
      calendar.animate({'opacity': '1'}, 600)
}

function calculationDates() { 
      let data = []
      for (const key in delivery) {
            let splitDates = delivery[key].split('-')
            data.push([])
            for (const i in splitDates) {
                  data[key].push(Date.parse(splitDates[i].split('.').reverse().join('-')))
            }
      }
      delivery = data
      calculateMinAndMaxDate()
}

function calculateMinAndMaxDate() {
      let min = delivery[0][0]
      let max = min
      for (const key in delivery) {
            for (i = 1; i < delivery[0].length; ++i) {
                  if (delivery[key][i] > max) max = delivery[key][i]
                  if (delivery[key][i] < min) min = delivery[key][i]
            }
      }

      min = new Date(min)
      max = new Date(max)
      
      minDateDelivery = converDate(min.getDate(), min.getMonth(), min.getFullYear())
      maxDateDelivery = converDate(max.getDate(), max.getMonth(), max.getFullYear())
}

function converDate(day, month, year) {
      return `${day >= 10  ?  day : `0${day}`}.${(month + 1) >= 10  ?  month + 1 : `0${month + 1}`}.${year}`
}

function calendarSettings() {
      $.datepicker.regional['ru'] = {
            closeText: 'Закрыть',
            prevText: 'Предыдущий',
            nextText: 'Следующий',
            currentText: 'Сегодня',
            monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
            dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
            dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
            dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
            weekHeader: 'Не',
            dateFormat: 'dd.mm.yy',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''
      }
      $.datepicker.setDefaults($.datepicker.regional['ru'])
}

function anew() {
      informationDelivery.removeAttr("style")
      informationDelivery.text('')
      selectedOption = {
            mark: '',
            model: '',
            year: ''
      }
      marks = []
      models = []
      years = []
      delivery = []
      minDateDelivery = ''
      maxDateDelivery = ''
      marksSelector.text('')
      marksSelector.append('<option class="placeholder" selected disabled hidden>Выберите марку</option>')      
      modelsSelector.text('')
      modelsSelector.append('<option class="placeholder" selected disabled hidden>Выберите модель</option>')      
      yearsSelector.text('')
      yearsSelector.append('<option class="placeholder" selected disabled hidden>Выберите год</option>')      
      $('.square__wrapp').show()
      circle.stop(true,true).animate()
      calendar.stop(true,true).animate()
      intro()
}
