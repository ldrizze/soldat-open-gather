var
  serverToken: String;
  serverURL: String;
  mainServerIp: String;
  gamePrepared: Boolean;
  inTieBreak: Boolean;
  status: String;
  tiebreakMapFromCommand: String;
  subCalled: Boolean;
  version: String;
  i: Byte;

function sendCommand (command: String): String;
begin
  WriteLn('Sending command: ' + command);
  try
    Result := GetURL(
      serverURL + '/command?command=' + HTTPEncode(command) + '&token=' + serverToken
    );
  except
    WriteLn('Could not possible call command, maybe wrong token or offline server?!');
    Result := '-';
  end;
end;

function parseGameStyle (): String;
begin
  if Game.GameStyle = 2 then Result := 'tm'
  else Result := 'ctf';
end;

procedure tellAll (msg: String);
var p: Byte;
begin
  for p := 1 to 32 do Players.Tell(msg);
end;

procedure tiebreakMap ();
begin
  tiebreakMapFromCommand := sendCommand(
    '!tiebreakmap ' +
    mainServerIp + ' ' +
    IntToStr(Game.ServerPort)
  );
end;

procedure prepareGame ();
begin
  Map.SetMap('Lobby');
  Game.Password := IntToStr(Random(100, 998));
  sendCommand(
    '!serverready ' +
    mainServerIp + ' ' +
    IntToStr(Game.ServerPort) + ' ' +
    Game.Password
  );
  gamePrepared := True;
end;

// !round map score_alpha score_bravo steam_id_player_1|score_player_1 ... steam_id_player_6|score_player_6
procedure sendMapStatistics ();
  var command: String;
      i,j: Byte;
      player: TActivePlayer;
begin
  command := '!round ' +
  mainServerIp + ' ' +
  IntToStr(Game.ServerPort) + ' ' +
  Game.CurrentMap + ' ' +
  IntToStr(Game.Teams[1].Score) + ' ' +
  IntToStr(Game.Teams[2].Score);

  for j := 1 to 2 do
    for i := 0 to Game.Teams[j].Count -1 do begin
      WriteLn(Game.Teams[j].Player[i].Name)
      player := TActivePlayer(Game.Teams[j].Player[i]);
      command := command + ' ' +
      player.SteamIDString + '|' + IntToStr(player.Kills) + '|' + IntToStr(player.Deaths);
    end;

  WriteLn('command until now: ' + command)
  sendCommand(command);
end;

procedure breathe ();
var commandResult: String;
begin
  status := sendCommand(
    '!breathe ' + mainServerIp + ' ' + IntToStr(Game.ServerPort) + ' ' + parseGameStyle() + ' ' + Game.ServerName
  );
  WriteLn('Status: ' + status)
  if (status = 'waiting_server') and (gamePrepared <> True) then prepareGame();
  if (status = 'waiting') then begin
    gamePrepared := False;
    inTieBreak := False;
    subCalled := False;
    tiebreakMapFromCommand := '-';
  end;
  if (status = 'tiebreak') and not inTieBreak then begin
    inTieBreak := True
    tiebreakMap();
  end;
  if (status = 'running') or (inTieBreak) then begin
    commandResult := sendCommand(
      '!callsub ' +
      mainServerIp + ' ' +
      IntToStr(Game.ServerPort)
    );

    if commandResult = '1' then tellAll('Um SUB foi encontrado. Aguarde até ele entrar.');
  end;
end;

procedure clockTick (Ticks: Integer);
begin
  breathe();
end;

procedure  beforeMapChange(next: String);
  var Score: Byte;
begin
  Score := Game.Teams[1].Score + Game.Teams[2].Score
  if ((Game.ScoreLimit = Score) or (Game.TimeLeft = 0)) and not (status = 'waiting') then begin
    sendMapStatistics();
  end;
end;

function playerAuth (Player: TActivePlayer; pin: String): String;
begin
  Result := sendCommand(
    '!playerauth ' +
    mainServerIp + ' ' +
    IntToStr(Game.ServerPort) + ' ' +
    pin + ' ' +
    Player.SteamIDString
  );
end;

function checkAuth (Player: TActivePlayer): Boolean;
var isAuth: Boolean;
    commandResult: String;
begin
  isAuth := False;
  commandResult := sendCommand('!checkplayerauth ' + Player.SteamIDString);
  if commandResult = '1' then isAuth := true;
  Result := isAuth;
end;

function S3ConPlayerCommand (Player: TActivePlayer; Command: String): Boolean;
var commandValue, cutCommand, authResult: String;
begin
  cutCommand := copy(Command, 1, 3);
  if cutCommand = '/a ' then begin
    commandValue := copy(Command, 4, Length(Command) - 3);
    if Length(commandValue) > 0 then begin
      authResult := playerAuth(Player, commandValue);
      if authResult = '0' then Player.Tell('PIN invalido. Nao foi possivel autenticar-se.');
    end;
  end;
  Result := True;
end;

procedure S3ConJoinTeam (Player: TActivePlayer; Team: TTeam);
begin
  if not checkAuth(Player) then begin
    Player.Tell(
      'Caso você tenha recebido um PIN, digite /a e o pin recebido pelo bot, ex: /a 123'
    );
  end;
end;

procedure S3COnSpeak (Player: TActivePlayer; Text: String);
var commandResult: String;
    textCommand: String;
    numSubs: String;
begin
  if (Text = '!tb') and not (tiebreakMapFromCommand = '-') then begin
    Map.SetMap(tiebreakMapFromCommand);
  end;

  textCommand := copy(Text, 1, 4);
  if textCommand = '!sub' then begin
    if Length(Text) > 4 then numSubs := copy(5, Length(Text));
    else numSubs := '1';
    commandResult := sendCommand(
      '!createsub ' +
      mainServerIp + ' ' +
      IntToStr(Game.ServerPort) + ' ' +
      numSubs
    );
    if commandResult = '1' then begin
      subCalled := True;
      tellAll('A fila de sub foi criada, aguarde até alguém entrar.');
    end;
  end;
end;

begin
  version := '0.2.15';
  inTieBreak := False;
  gamePrepared := False;
  subCalled := False;
  status := 'waiting';
  tiebreakMapFromCommand := '-';
  serverToken := ReadINI(Script.Dir + 'config.ini', 'Server', 'token', '-');
  serverURL   := ReadINI(Script.Dir + 'config.ini', 'Server', 'url', '-');
  mainServerIp   := ReadINI(Script.Dir + 'config.ini', 'Server', 'ip', '-');

  WriteLn('Gather version: ' + version);
  if not (serverToken = '-') and
     not (serverURL = '-') and
     not (mainServerIp = '-') then begin
    Game.TickThreshold := 60 * 5; // 1 minute
    Game.OnClockTick := @clockTick;
    Map.OnBeforeMapChange := @beforeMapChange;
    Game.Teams[1].onJoin := @S3ConJoinTeam;
    Game.Teams[2].onJoin := @S3ConJoinTeam;
    for i:=1 to 32 do begin
      Players[i].OnSpeak := @S3COnSpeak;
      Players[i].OnCommand := @S3ConPlayerCommand;
    end;
  end else begin
    WriteLn('Server configuration mismatch');
    WriteLn('serverToken' + serverToken);
    WriteLn('serverURL' + serverURL);
    WriteLn('mainServerIp' + mainServerIp);
  end;
end.
