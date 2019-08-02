import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../shared/services/authentication.service';
import { FormBuilder, Validators } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import mockSliders from './mockSlides';
import mockMenu from './mockMenu';
import { NgRedux } from '@angular-redux/store';
import { AppStateI } from 'app/interfaces';
import { setUserEmail } from 'app/redux/actions';

@Component({
    selector: 'login-2',
    templateUrl: 'login.component.html',
    styleUrls: ['./login-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: any;
    submitted = false;
    blocked: boolean;
    sliders: any;
    pauseSliders = false;
    counter;
    sliderContentErrors = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public ngRedux: NgRedux<AppStateI>,
        private fb: FormBuilder) {

        this.initForm();
    }

    initForm() {
        this.loginForm = this.fb.group({
            email: ['sample@gmail.com', [Validators.required]],
            password: ['password', Validators.required]
        });
        this.submitted = false;
    }

    login() {
        this.submitted = true;

        if (!this.loginForm.valid) {
            return;
        }
        this.blocked = true;
        this.ngRedux.dispatch(setUserEmail(this.loginForm.value.email));
        const menuItems = localStorage.getItem('menu');
        if (menuItems) {
           return this.router.navigate(['sample']).catch(err => console.log(err));
        }
    
        localStorage.setItem('menu', JSON.stringify(mockMenu));
        localStorage.setItem('id_token', 'sample-token');
       
    }

    ngOnInit(): void {
        this.initForm();
        this.sliders = mockSliders;  // Load slides from cloud here

        this.validateSiders(this.sliders);
       if (this.sliders.length > 1) {
        setInterval( this.changeSlider, 5000);
       }
    }
    
    changeSlider = () => {
        //  this.sliders.map(slider => slider.makeThisFirstSlide = false);
        for (let i = 0; i < this.sliders.length; i += 1) {
            
            if (this.sliders[i].makeThisFirstSlide === true) {
                this.counter = setTimeout(() => {
                  if (i === this.sliders.length - 1) {
                    this.sliders.map(slider => slider.makeThisFirstSlide = false);
                       this.sliders[0].makeThisFirstSlide = true;
                  } else {
                    this.sliders.map(slider => slider.makeThisFirstSlide = false);
                       this.sliders[i + 1].makeThisFirstSlide = true;
                  }
                }, 5000);
           } 
        }
    }

    carouselNavigation = (direction) => {
        clearInterval(this.counter);
        const sliders = this.sliders;
        if (sliders.length < 2) {
            return;
        }
        const activeSliderIndex = sliders.indexOf(sliders.find(slider => slider.makeThisFirstSlide === true));
        if (direction === 'backward') {
            if (activeSliderIndex !== 0) {
                sliders[activeSliderIndex - 1].makeThisFirstSlide = true;
                sliders[activeSliderIndex].makeThisFirstSlide = false;
            } else {
                sliders[sliders.length - 1].makeThisFirstSlide = true;
                sliders[activeSliderIndex].makeThisFirstSlide = false;
            }

        } 
        
        if (direction === 'forward') {
            if (activeSliderIndex !== sliders.length - 1) {
                sliders[activeSliderIndex + 1].makeThisFirstSlide = true;
                sliders[activeSliderIndex].makeThisFirstSlide = false;
            } else  {
                sliders[0].makeThisFirstSlide = true;
                sliders[activeSliderIndex].makeThisFirstSlide = false;
            }
        } 
    }

    addOver(event, hoverStyle): void {
        event.target.style.background = hoverStyle.background;
    }

    removeOverEffect(event, originalStyle): void {
        event.target.style.background = originalStyle.background;
    }

    // Handle dot navigation
    dotNavigation = (sliderIndex) => {
        clearInterval(this.counter);
       this.sliders.map((slide, index) => {
            if (index === sliderIndex) {
                slide.makeThisFirstSlide = true;
            } else {
                slide.makeThisFirstSlide = false;
            }
       });
       
    }

    validateSiders = (sliders) => {
        const activeElementArray = [];
        
        sliders.map(slider => {
            const ext = slider.logoUrl.substr(slider.logoUrl.lastIndexOf('.') + 1);

            const allowedExt = ['svg' , 'png'];
            if (!allowedExt.includes(ext)) {
                this.sliderContentErrors.push('Only svg or png images are allowed as logo');
            }

            // const sliderImage = new Image();
            // const classThis = this;
            // sliderImage.onload = function(): void {
            //    if (this.width < this.height || this.width === this.height || this.width < 700 || this.height < 500 ) {
            //        classThis.sliderContentErrors.push(slider.slideImageUrl + ' => should be a landscape image of atleast 700 x 500');

            //    }
            // };
            // sliderImage.src = slider.slideImageUrl;

           if (slider.makeThisFirstSlide === true) {
            activeElementArray.push(slider);
           }
            if (activeElementArray.length > 1) {
                this.sliderContentErrors.push('Only one element should have the property value of "makeThisFirstSlide" as true');
            }
        });
    }

}
