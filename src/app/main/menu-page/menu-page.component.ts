import {Component, OnInit, Input} from '@angular/core';   
import { Router } from '@angular/router';
import MockMenuIcons from './mockMenu';

@Component({ 
  selector: 'menu-page',
  templateUrl: './menu-page.component.html',
    styleUrls  : ['./menu-page.component.scss']
 })

export class MenuPageComponent implements OnInit {
  
  menus = [];
  showSiblings = false;
  siblingMenus = [];
  menuCrumbs = [];
  currentIndex: number;
  menuLevelTracker = 0;

  constructor(private router: Router) {}

    ngOnInit(): void {
      const menus = JSON.parse(localStorage.getItem('menu'))[0].children;
      this.menus = this.mapIconsToMenu(menus);
      
    }

    menuClick = (selectedMenuItem, index) => {
      if (selectedMenuItem.children  && selectedMenuItem.children.length > 0) {

        this.showSiblings = true;
        this.menuLevelTracker += 1;

        if (this.menuLevelTracker === 1) {
          this.currentIndex = index;
        }

        this.menuCrumbs.push(selectedMenuItem.title);
        this.siblingMenus = selectedMenuItem.children;
        this.siblingMenus.map(menu => {
          menu.menuIcon = MockMenuIcons[(Math.floor(Math.random() * MockMenuIcons.length))].icon;
          menu.style = selectedMenuItem.style;
          return menu;
        });
        return;
      }
        selectedMenuItem.active = true;
       this.router.navigate([`/sample-1/${(selectedMenuItem.id).trim()}`]);
      
    }

    backNav = () => {
      if (this.menuLevelTracker === 1) {
        this.showSiblings = false;
        this.menuLevelTracker = 0;
        this.menuCrumbs = [];
      } else {
        this.menuCrumbs.pop();
        this.menuLevelTracker -= 1;
        this.siblingMenus = this.menus[this.currentIndex].children;
      }
    }


    mapIconsToMenu = (menuToMap) => {
      menuToMap.forEach(menu => {
        const id = (menu.id).trim();
        MockMenuIcons.forEach(mockMenu => {
            if (id === mockMenu.id) {
              if (mockMenu.style) {
                menu.style = mockMenu.style;
              }
               menu.menuIcon = `assets/images/menu-icons/${id}.png`;
            }
            return mockMenu;
          });
          return menu;
      });

      return menuToMap;
    }
}


