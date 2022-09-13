// Board const
const BOARD_SIZE = 7;
const MIDDLE_ROW_COLUMN = 3;
const WALL = -2;
const UNAVAILABLE = -1;
const EMPTY = 0;
const WHITE_PIECE = 1;
const BLACK_PIECE = 2;
const PIECES = 18;

/* Game state const
   0 - Game not started
   1 - Placing pieces
   2 - Moving pieces
   3 - Removing pieces */
const GAME_NOT_STARTED = 0;
const PLACING_PIECES = 1;
const MOVING_PIECES = 2;
const REMOVING_PIECES = 3;
const GAME_ENDED = 4;

class NineMensMorris{
	constructor(){
		// Init board
		this.board = Array(BOARD_SIZE);
		for(let i=0;i<BOARD_SIZE;i++){
			this.board[i] = Array(BOARD_SIZE).fill((i===MIDDLE_ROW_COLUMN) ? EMPTY : UNAVAILABLE);
		}
		// Adding Empty Available spaces
		for(let i=1;i<=MIDDLE_ROW_COLUMN;i++){
			let start = MIDDLE_ROW_COLUMN-i;
			for(let j=start;j<BOARD_SIZE-start;j+=i){
				this.board[MIDDLE_ROW_COLUMN+i][j] = this.board[MIDDLE_ROW_COLUMN-i][j] = EMPTY;				
			}
		}
		// Adding Unavailable MIDDLE ROW And COLUMN space
		this.board[MIDDLE_ROW_COLUMN][MIDDLE_ROW_COLUMN] = WALL;
		// Init Attributes
		this.phase = PLACING_PIECES;
		this.turn = WHITE_PIECE;
		this.pieces = {};
		this.pieces[WHITE_PIECE]=0;
		this.pieces[BLACK_PIECE]=0;
		this.addedPieces = 0;
	}
	
	changeTurn(){
		if(this.phase !== GAME_ENDED)
			this.turn = (this.turn % BLACK_PIECE) + WHITE_PIECE;
		return this.turn;
	}
	
	checkMills(r,c){
		let color = this.board[r][c]
		// Found Mills Flag
		let flag = true;
		// Check Column Mills		
		let start = (r===MIDDLE_ROW_COLUMN && c > MIDDLE_ROW_COLUMN) ? MIDDLE_ROW_COLUMN+1 : 0;
		let end = (r===MIDDLE_ROW_COLUMN && c < MIDDLE_ROW_COLUMN) ? MIDDLE_ROW_COLUMN : BOARD_SIZE;
		for(let i=start;i<end;i++){
			if(this.board[r][i] !== UNAVAILABLE && this.board[r][i] !== color){
				flag = false;
				break;
			}
		}
		// If found a mills return true
		if(flag) return flag;
		flag = true;
		// Check Row Mills
		start = (c===MIDDLE_ROW_COLUMN && r > MIDDLE_ROW_COLUMN) ? MIDDLE_ROW_COLUMN+1 : 0;
		end = (c===MIDDLE_ROW_COLUMN && r < MIDDLE_ROW_COLUMN) ? MIDDLE_ROW_COLUMN : BOARD_SIZE;
		for(let i=start;i<end;i++){
			if(this.board[i][c] !== UNAVAILABLE && this.board[i][c] !== color){
				flag = false;
				break;
			}
		}
		return flag;
	}
	
	checkMove(old_r,old_c,new_r,new_c){
		if(this.board[new_r][new_c]===EMPTY && this.board[old_r][old_c]>EMPTY){
			if(old_r===new_r || old_c === new_c || this.pieces[this.board[old_r][old_c]]!==3){
				for(let i=Math.min(old_r,new_r);i<=Math.max(old_r,new_r);i++){
					for(let j=Math.min(old_c,new_c);j<=Math.max(old_c,new_c);j++){
						if(this.board[i][j]!==UNAVAILABLE &&(i!==old_r||j!==old_c)&&(i!==new_r||j!==new_c))
							return false;
					}
				}
			}
			return true;
		}
		return false;
	}
	
	canDeletePieces(color){
		let oppositeColor = (color % BLACK_PIECE) + WHITE_PIECE;
		for(let i=0;i<BOARD_SIZE;i++){
			for(let j=0;j<BOARD_SIZE;j++){
				if(this.board[i][j]===oppositeColor && !this.checkMills(i,j))
					return true;
			}
		}
		return false;
	}
	
	addPiece(r,c,color){
		if(this.phase === PLACING_PIECES && this.board[r][c] === EMPTY){
			this.board[r][c] = color;
			this.pieces[color]++;
			this.addedPieces++;
			if(this.checkMills(r,c) && this.canDeletePieces(this.turn)){
				this.phase = REMOVING_PIECES;
			}else{
				this.phase = (this.addedPieces === PIECES) ? MOVING_PIECES : PLACING_PIECES;
				this.changeTurn();
			}
			return true;
		}
		return false;
	}
	
	movePiece(old_r,old_c,new_r,new_c){
		if(this.phase===MOVING_PIECES && this.turn===this.board[old_r][old_c] && this.checkMove(old_r,old_c,new_r,new_c)){
			let color = this.board[old_r][old_c];
			this.board[old_r][old_c] = EMPTY;
			this.board[new_r][new_c] = color;
			if(this.checkMills(new_r,new_c) && this.canDeletePieces(this.turn)) this.phase = REMOVING_PIECES;
			else this.changeTurn();
			return true;
		}
		return false;
	}
	
	removePiece(r,c){
		if(this.phase===REMOVING_PIECES && this.board[r][c]>EMPTY && this.turn!==this.board[r][c]){
			if(!this.checkMills(r,c)){
				let color = this.board[r][c];
				this.pieces[color]--;
				this.board[r][c] = EMPTY;
				if(this.addedPieces === PIECES)
					if(this.pieces[color] < 3)
						this.phase = GAME_ENDED;
					else 
						this.phase = MOVING_PIECES;
				else
					this.phase =  PLACING_PIECES;
				this.changeTurn();
				return true;
			}
		}
		return false;
	}
}

// Utilities

function phaseToString(phase){
	switch(phase){
		case GAME_NOT_STARTED: return "GAME NOT STARTED";
		case PLACING_PIECES: return "PLACING PIECES";
		case MOVING_PIECES: return "MOVING PIECES";
		case REMOVING_PIECES: return "REMOVING PIECES";
		case GAME_ENDED: return "GAME ENDED";
	}
	return null;
}

function turnToString(turn){
	switch(turn){
		case WHITE_PIECE: return "WHITE PLAYER";
		case BLACK_PIECE: return "BLACK PLAYER";
	}
	return null;
}