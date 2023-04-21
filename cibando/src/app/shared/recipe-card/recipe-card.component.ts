import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Recipe } from 'src/app/models/recipe.model';
import { RecipeService } from 'src/app/services/recipe.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeCardComponent implements OnInit {
  @Input() pag: string;
  @Output() messaggio = new EventEmitter();

  percorsoDifficolta = "../../../../assets/images/difficolta-";
  cliccato = false;
  ricette: Recipe[] = [];
  page = 1;
  ricettePerPagina = 4;
  immagine: string;
  titolo: string;
  id: string;
  description: string;
  difficulty: number;
  published: boolean;
  user: User;
  ricetta: Recipe;

  modifica: Recipe;
  ruolo: any;
  preferite: [];

  //rowsPerPageOptions: number;
  //pagingNumber = 0;
  //first: number = 0;

  ricette$: Observable<Recipe[]>;
  totRicette: Recipe[] = [];
  totale: number;

  constructor(
    private recipeService: RecipeService,
    private modalService: NgbModal,
    private messageService: MessageService,
    private userService: UserService,
    // private cdRef: ChangeDetectorRef
    ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    // if(this.pag == 'home') {
    //   this.ricette$ = this.recipeService.getRecipes().pipe(
    //      map(res => res.filter(ricetteFiltrate => ricetteFiltrate.difficulty < 6 )),
    //      map(res => res.slice(0,4 )),
    //      map(res => this.totRicette = res)
    //   )
    // } else {
    //   this.ricette$ = this.recipeService.getRecipes().pipe(
    //     map(res => res.filter(ricetteFiltrate => ricetteFiltrate.difficulty < 6 )),
    //     map(res => this.totRicette = res )
    //   )
    // }

    this.prendiRicette();


    //this.pagine();
    if(JSON.parse(localStorage.getItem('user')) !== null) {
      this.ruolo = JSON.parse(localStorage.getItem('user')).role;
    }

    if(JSON.parse(localStorage.getItem('user')) !== null) {
      this.preferite = JSON.parse(localStorage.getItem('user')).preferite;
    }

  }

  // ngDoCheck(){
  //   this.prendiRicette();
  // }

  inviaTitolo(titolo: string){
    if(!this.cliccato){
      this.messaggio.emit(titolo);
      this.cliccato = true;
    } else {
      this.messaggio.emit('');
      this.cliccato = false;
    }
    // oppure con ternario
   // this.cliccato ? (this.messaggio.emit(''), this.cliccato = false) : (this.messaggio.emit(titolo), this.cliccato = true);
  }

    // pagine(){
    //   let tot;
    //   if(this.ricette){
    //     tot = this.ricette.length
    //   }

    //   this.page = 1;
    //   this.pagingNumber = 0;
    //   this.pagingNumber = Math.ceil(this.ricette.length / this.ricettePerPagina / 4);
    // }

    paginate(event) {
       event.page =event.page + 1;
      this.page = event.page;
  }

  openDelete(content: any, ricetta: Recipe){
    this.immagine = ricetta.image;
    this.titolo = ricetta.title;
    this.id = String(ricetta._id);

    this.modalService.open(content, {ariaLabelledBy: 'modaleServizi', size: 'lg', centered: true}).result.then((res) => {
      // (close) Elimina Ricetta
      this.recipeService.deleteRecipes(this.id).subscribe({
        next: (res) => {
          this.ricette = res;
          this.prendiRicette();
        },
        error: (err) => {
          console.log(err);
        }
      })

    }).catch((res) => {

      // (dismiss) Chiude modale

    });
  }

  prendiRicette() {
    this.recipeService.getRecipes().subscribe({
      next: (res) => {
        this.ricette = res;
        this.ricettePubblicate();
        if(this.pag == 'home'){
          this.ricette = this.ricette.sort((a,b) => b._id - a._id).reverse().slice(0,4);
          this.totRicette = this.ricette;
        } else {
          this.ricette = this.ricette.sort((a,b) => b._id - a._id).reverse();
          this.totRicette = this.ricette;
        }
      },
      error: (e) => {
        console.error(e)
      }
    });
  }

  ricettePubblicate() {
    if(this.ruolo !== 'admin') {
      this.ricette = this.ricette.filter( (control) => {
        return control.published;
      })
    }
  }

  nascondi(ricetta: Recipe) {
    ricetta.published = false;
    this.recipeService.updateRecipe(ricetta).subscribe({
      next: (res) => {
        ricetta = res;
        this.messageService.add({severity:'success', summary:'Successo', detail:'Visibilità modificata con successo', life: 3000});
        console.log('eccomi');
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({severity:'error', summary:'Errore', detail: "Errore nell'aggiornamento"});
      }
    });
  }

  mostra(ricetta: Recipe) {
    ricetta.published = true;
    this.recipeService.updateRecipe(ricetta).subscribe({
      next: (res) => {
        ricetta = res;
        this.messageService.add({severity:'success', summary:'Successo', detail:'Visibilità modificata con successo', life: 3000});
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({severity:'error', summary:'Errore', detail: "Errore nell'aggiornamento"});
      }
    });
  }

  openModifica(content: any, ricetta: Recipe){
    this.id = String(ricetta._id);
    this.titolo = ricetta.title;
    this.description = ricetta.description;
    this.immagine = ricetta.image;
    this.difficulty = ricetta.difficulty;
    this.published = ricetta.published;

    this.modalService.open(content, {ariaLabelledBy: 'modaleServizi', size: 'lg', centered: true}).result.then((res) => {
      // (close) Chiude modale

    }).catch((res) => {
      this.prendiRicette();
      // (dismiss) Chiude modale

    });
  }

  closeModal(e: any){
    this.modalService.dismissAll();
    this.prendiRicette();
  }

  preferiti(id: number) {
    this.user.preferite.push(id);
    localStorage.setItem('user', JSON.stringify(this.user));
    this.userService.updateUser(this.user).subscribe({
      next: (res) => {
        // this.user = res;
        console.log('funziona');
        this.prendiRicette();
        console.log('test');
      },
      error: (err) => {
        console.log(err);
      }
    });
    // this.cdRef.markForCheck();
  }

  annulla(id: number) {
    for( var i = 0; i < this.user.preferite.length; i++){
      if ( this.user.preferite[i] === id) {
        this.user.preferite.splice(i, 1);
      }
    }
    localStorage.setItem('user', JSON.stringify(this.user));
    this.userService.updateUser(this.user).subscribe({
      next: (res) => {
        // this.user = res;
        console.log('funziona');
        this.prendiRicette();
        console.log('test');
      },
      error: (err) => {
        console.log(err);
      }
    });
    // this.cdRef.markForCheck();
  }

  isPreferite(id: number): boolean{
    // console.log(this.preferite.find(item => item === id));
    return this.preferite.find(item => item === id)? true: false;
  }
}
